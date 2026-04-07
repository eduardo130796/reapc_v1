def detectar_dependencias(itens_dict, parametros):
    dependencias = {}
    for id_tecnico, item in itens_dict.items():
        tipo = item.get("tipo")
        config = item.get("config", {})
        
        if tipo in ["soma", "multiplicacao", "subtracao_limitada", "percentual_parametrizado", "percentual_truncado", "percentual_fixo"]:
            dependencias[id_tecnico] = config.get("base", [])
        elif tipo == "por_dentro_base":
            dependencias[id_tecnico] = config.get("base", []) + [config.get("percentual_base")] if config.get("percentual_base") else config.get("base", [])
        else:
            dependencias[id_tecnico] = []
            
    for item_id, bases in dependencias.items():
        for base in bases:
            if base not in itens_dict and base not in parametros:
                parametros.setdefault(base, 0)
    return dependencias

def calcular_pcfp(estrutura, parametros):
    if "modulos" not in estrutura:
        raise ValueError("Estrutura inválida: 'modulos' não encontrado")

    resultados = {}
    itens_dict = {}

    for modulo in estrutura.get("modulos", []):
        for item in modulo.get("itens", []):
            itens_dict[item["id_tecnico"]] = item
        for sub in modulo.get("submodulos", []):
            for item in sub.get("itens", []):
                itens_dict[item["id_tecnico"]] = item

    dependencias = detectar_dependencias(itens_dict, parametros)

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

    def calcular_item(id_tecnico):
        if id_tecnico in resultados:
            return resultados[id_tecnico]

        if id_tecnico in parametros and id_tecnico not in itens_dict:
            resultados[id_tecnico] = parametros[id_tecnico]
            return resultados[id_tecnico]

        item = itens_dict[id_tecnico]
        tipo = item["tipo"]
        config = item.get("config", {})

        if tipo == "parametro":
            valor = parametros.get(id_tecnico, 0)

        elif tipo == "soma":
            valor = sum(calcular_item(b) for b in config.get("base", []))

        elif tipo == "multiplicacao":
            valor = 1
            for b in config.get("base", []):
                valor *= calcular_item(b)

        elif tipo == "subtracao_limitada":
            base = config.get("base", [])
            bruto = calcular_item(base[0]) if len(base) > 0 else 0
            desconto = calcular_item(base[1]) if len(base) > 1 else 0
            valor = max(bruto - desconto, 0)

        elif tipo == "percentual_parametrizado":
            base_valor = sum(calcular_item(b) for b in config.get("base", []))
            if item.get("parametro") in parametros:
                percentual = parametros[item["parametro"]]
            else:
                percentual = calcular_item(item.get("parametro"))
            valor = base_valor * (percentual / 100)

        elif tipo == "percentual_truncado":
            base_valor = sum(calcular_item(b) for b in config.get("base", []))
            if "parametro" in item:
                percentual = parametros.get(item["parametro"], 0)
            elif "percentual_base" in config:
                percentual = calcular_item(config["percentual_base"])
            elif "percentual" in config:
                percentual = config["percentual"]
            else:
                raise ValueError(f"Percentual não definido em '{id_tecnico}'")
            valor_bruto = base_valor * (percentual / 100)
            valor = int(valor_bruto * 100) / 100

        elif tipo == "percentual_fixo":
            base_valor = sum(calcular_item(b) for b in config.get("base", []))
            percentual = config.get("percentual", 0)
            valor = base_valor * percentual

        elif tipo == "por_dentro_base":
            percentual = calcular_item(config.get("percentual_base")) / 100
            base_val = calcular_item(config["base"][0]) if config.get("base") else 0
            valor = base_val / (1 - percentual) if percentual < 1 else base_val
        else:
            raise ValueError(f"Tipo não suportado: {tipo}")

        resultados[id_tecnico] = valor
        return valor

    for id_tecnico in itens_dict:
        calcular_item(id_tecnico)

    return resultados

def calcular_pcfp_simulacao(estrutura, parametros):
    resultados = {}
    itens_dict = {}

    for modulo in estrutura.get("modulos", []):
        for item in modulo.get("itens", []):
            itens_dict[item["id_tecnico"]] = item
        for sub in modulo.get("submodulos", []):
            for item in sub.get("itens", []):
                itens_dict[item["id_tecnico"]] = item

    def calcular_item(id_tecnico):
        if id_tecnico in resultados:
            return resultados[id_tecnico]

        if id_tecnico in parametros and id_tecnico not in itens_dict:
            resultados[id_tecnico] = parametros[id_tecnico]
            return resultados[id_tecnico]

        item = itens_dict.get(id_tecnico)
        if not item:
            return 0

        tipo = item.get("tipo")
        config = item.get("config", {})

        try:
            if tipo == "parametro":
                valor = parametros.get(id_tecnico, 0)
            elif tipo == "soma":
                valor = sum(calcular_item(b) for b in config.get("base", []))
            elif tipo == "multiplicacao":
                valor = 1
                for b in config.get("base", []):
                    valor *= calcular_item(b)
            elif tipo == "subtracao_limitada":
                base = config.get("base", [])
                bruto = calcular_item(base[0]) if len(base) > 0 else 0
                desconto = calcular_item(base[1]) if len(base) > 1 else 0
                valor = max(bruto - desconto, 0)
            elif tipo == "percentual_parametrizado":
                base_valor = sum(calcular_item(b) for b in config.get("base", []))
                if item.get("parametro") in parametros:
                    percentual = parametros[item["parametro"]]
                else:
                    percentual = calcular_item(item.get("parametro"))
                valor = base_valor * (percentual / 100)
            elif tipo == "percentual_truncado":
                base_valor = sum(calcular_item(b) for b in config.get("base", []))
                if "parametro" in item:
                    percentual = parametros.get(item["parametro"], 0)
                elif "percentual_base" in config:
                    percentual = calcular_item(config["percentual_base"])
                elif "percentual" in config:
                    percentual = config["percentual"]
                else:
                    percentual = 0
                valor_bruto = base_valor * (percentual / 100)
                valor = int(valor_bruto * 100) / 100
            elif tipo == "percentual_fixo":
                base_valor = sum(calcular_item(b) for b in config.get("base", []))
                percentual = config.get("percentual", 0)
                valor = base_valor * percentual
            elif tipo == "por_dentro_base":
                percentual = calcular_item(config.get("percentual_base")) / 100
                base_val = calcular_item(config.get("base")[0]) if config.get("base") else 0
                valor = base_val / (1 - percentual) if percentual < 1 else base_val
            else:
                valor = 0
        except Exception:
            valor = 0

        resultados[id_tecnico] = valor
        return valor

    for id_tecnico in itens_dict.keys():
        calcular_item(id_tecnico)

    return resultados