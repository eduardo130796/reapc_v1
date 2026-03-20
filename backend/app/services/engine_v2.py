def calcular_pcfp_v2(estrutura, parametros):

    resultados = {}

    itens_dict = {}

    # --------------------------------------------------
    # MAPEAR TODOS OS ITENS DO MODELO
    # --------------------------------------------------

    for modulo in estrutura["modulos"]:

        for item in modulo.get("itens", []):
            itens_dict[item["id_tecnico"]] = item

        for sub in modulo.get("submodulos", []):
            for item in sub.get("itens", []):
                itens_dict[item["id_tecnico"]] = item

    # --------------------------------------------------
    # FUNÇÃO RECURSIVA DE CÁLCULO
    # --------------------------------------------------

    def calcular_item(id_tecnico):

        # já calculado
        if id_tecnico in resultados:
            return resultados[id_tecnico]

        # parâmetro informado pelo usuário
        if id_tecnico in parametros:
            resultados[id_tecnico] = parametros[id_tecnico]
            return resultados[id_tecnico]

        if id_tecnico not in itens_dict:
            raise Exception(f"Parâmetro ou item não encontrado: {id_tecnico}")

        item = itens_dict[id_tecnico]

        tipo = item["tipo"]

        config = item.get("config", {})

        # --------------------------------------------------
        # PARAMETRO
        # --------------------------------------------------

        if tipo == "parametro":

            valor = parametros.get(id_tecnico, 0)

        # --------------------------------------------------
        # SOMA
        # --------------------------------------------------

        elif tipo == "soma":

            valor = sum(
                calcular_item(b)
                for b in config.get("base", [])
            )

        # --------------------------------------------------
        # MULTIPLICAÇÃO
        # --------------------------------------------------

        elif tipo == "multiplicacao":

            valor = 1

            for b in config.get("base", []):
                valor *= calcular_item(b)

        # --------------------------------------------------
        # SUBTRAÇÃO LIMITADA
        # --------------------------------------------------

        elif tipo == "subtracao_limitada":

            bruto = calcular_item(config["base"][0])

            desconto = calcular_item(config["base"][1])

            valor = max(bruto - desconto, 0)

        # --------------------------------------------------
        # PERCENTUAL PARAMETRIZADO
        # --------------------------------------------------

        elif tipo == "percentual_parametrizado":

            percentual = parametros.get(item["parametro"], 0)

            base = sum(calcular_item(b) for b in config["base"])

            valor = base * percentual

        # --------------------------------------------------
        # PERCENTUAL FIXO
        # --------------------------------------------------

        elif tipo == "percentual_fixo":

            percentual = config["percentual"]

            base = sum(calcular_item(b) for b in config["base"])

            valor = base * percentual

        # --------------------------------------------------
        # PERCENTUAL TRUNCADO
        # --------------------------------------------------

        elif tipo == "percentual_truncado":

            if "parametro" in item:
                percentual = parametros.get(item["parametro"], 0)
            else:
                percentual = calcular_item(config["percentual_base"])

            base = sum(calcular_item(b) for b in config["base"])

            valor = base * percentual

        # --------------------------------------------------
        # POR DENTRO
        # --------------------------------------------------

        elif tipo == "por_dentro_base":

            percentual = calcular_item(config["percentual_base"])

            base = sum(calcular_item(b) for b in config["base"])

            valor = base / (1 - percentual)

        else:

            raise Exception(f"Tipo não suportado: {tipo}")

        resultados[id_tecnico] = valor

        return valor

    # --------------------------------------------------
    # CALCULAR TODOS OS ITENS
    # --------------------------------------------------

    for id_tecnico in itens_dict.keys():
        calcular_item(id_tecnico)

    return resultados