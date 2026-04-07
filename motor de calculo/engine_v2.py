def calcular_pcfp_v2(estrutura, parametros):

    resultados = {}
    itens_dict = {}
    dependencias = {}

    # ======================================
    # 1. COLETAR TODOS OS ITENS
    # ======================================
    for modulo in estrutura["modulos"]:

        for item in modulo.get("itens", []):
            itens_dict[item["id_tecnico"]] = item

        for sub in modulo.get("submodulos", []):
            for item in sub.get("itens", []):
                itens_dict[item["id_tecnico"]] = item

    # ======================================
    # 2. MAPEAR DEPENDÊNCIAS
    # ======================================
    for id_tecnico, item in itens_dict.items():

        tipo = item["tipo"]

        if tipo in ["soma", "multiplicacao", "subtracao_limitada"]:
            dependencias[id_tecnico] = item["config"]["base"]

        elif tipo in ["percentual_parametrizado", "percentual_truncado", "percentual_fixo"]:
            dependencias[id_tecnico] = item["config"]["base"]

        elif tipo == "por_dentro_base":
            dependencias[id_tecnico] = item["config"]["base"] + [item["config"]["percentual_base"]]

        else:
            dependencias[id_tecnico] = []

    # ======================================
    # 3. VALIDAR DEPENDÊNCIAS INEXISTENTES
    # ======================================
    for item_id, bases in dependencias.items():
        for base in bases:
            if base not in itens_dict and base not in parametros:
                parametros.setdefault(base, 0)
                

    # ======================================
    # 4. DETECTAR CICLO
    # ======================================
    visitado = set()
    pilha = set()

    def detectar_ciclo(no):
        if no in pilha:
            raise ValueError(f"Dependência circular detectada em '{no}'")

        if no not in visitado:
            pilha.add(no)
            for vizinho in dependencias.get(no, []):
                if vizinho in itens_dict:
                    detectar_ciclo(vizinho)
            pilha.remove(no)
            visitado.add(no)

    for item_id in dependencias:
        detectar_ciclo(item_id)

    # ======================================
    # 5. CÁLCULO RECURSIVO
    # ======================================
    def calcular_item(id_tecnico):

        if id_tecnico in resultados:
            return resultados[id_tecnico]

        # Se for parâmetro puro
        if id_tecnico in parametros and id_tecnico not in itens_dict:
            resultados[id_tecnico] = parametros[id_tecnico]
            return resultados[id_tecnico]

        item = itens_dict[id_tecnico]
        tipo = item["tipo"]

        # ------------------------
        # PARAMETRO
        # ------------------------
        if tipo == "parametro":
            valor = parametros.get(id_tecnico, 0)

        # ------------------------
        # SOMA
        # ------------------------
        elif tipo == "soma":
            valor = sum(calcular_item(b) for b in item["config"]["base"])

        # ------------------------
        # MULTIPLICAÇÃO
        # ------------------------
        elif tipo == "multiplicacao":
            valor = 1
            for b in item["config"]["base"]:
                valor *= calcular_item(b)

        # ------------------------
        # SUBTRAÇÃO LIMITADA
        # ------------------------
        elif tipo == "subtracao_limitada":
            bruto = calcular_item(item["config"]["base"][0])
            desconto = calcular_item(item["config"]["base"][1])
            valor = max(bruto - desconto, 0)

        # ------------------------
        # PERCENTUAL PARAMETRIZADO
        # ------------------------
        elif tipo == "percentual_parametrizado":
            base_valor = sum(calcular_item(b) for b in item["config"]["base"])
            if item["parametro"] in parametros:
                percentual = parametros[item["parametro"]]
            else:
                percentual = calcular_item(item["parametro"])
            valor = base_valor * (percentual / 100)

        # ------------------------
        # PERCENTUAL TRUNCADO (COM PARAMETRO OU BASE)
        # ------------------------
        elif tipo == "percentual_truncado":

            base_valor = sum(calcular_item(b) for b in item["config"]["base"])

            if "parametro" in item:
                percentual = parametros.get(item["parametro"], 0)

            elif "percentual_base" in item["config"]:
                percentual = calcular_item(item["config"]["percentual_base"])

            elif "percentual" in item["config"]:
                percentual = item["config"]["percentual"]

            else:
                raise ValueError(f"Percentual não definido em '{id_tecnico}'")

            valor_bruto = base_valor * (percentual / 100)
            valor = int(valor_bruto * 100) / 100
        # ------------------------
        # PERCENTUAL FIXO
        # ------------------------
        elif tipo == "percentual_fixo":

            base_valor = sum(calcular_item(b) for b in item["config"]["base"])
            percentual = item["config"]["percentual"]

            valor = base_valor * percentual
        # ------------------------
        # POR DENTRO
        # ------------------------
        elif tipo == "por_dentro_base":

            percentual = calcular_item(item["config"]["percentual_base"]) / 100
            base = calcular_item(item["config"]["base"][0])

            valor = base / (1 - percentual)

        else:
            raise ValueError(f"Tipo não suportado: {tipo}")

        resultados[id_tecnico] = valor
        return valor

    # ======================================
    # 6. EXECUTAR TODOS
    # ======================================
    for id_tecnico in itens_dict:
        calcular_item(id_tecnico)

    # ======================================
    # 7. SUBTOTAL AUTOMÁTICO
    # ======================================
    # ======================================
    # SUBTOTAL MÃO DE OBRA (1 a 5)
    # ======================================

    subtotal_mao_de_obra = (
        resultados.get("total_remuneracao", 0)
        + resultados.get("total_modulo_2", 0)
        + resultados.get("total_modulo_3", 0)
        + resultados.get("total_modulo_4", 0)
        + resultados.get("total_modulo_5", 0)
    )

    resultados["subtotal_mao_de_obra"] = subtotal_mao_de_obra

    # ======================================
    # TOTAL FINAL
    # ======================================

    total_unitario = subtotal_mao_de_obra + resultados.get("total_modulo_6", 0)

    resultados["total_unitario"] = total_unitario

    return {
        "resultados": resultados,
        "total_unitario": total_unitario
    }