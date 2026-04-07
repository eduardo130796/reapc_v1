from calculo import ItemCalculo, Modulo, Cargo, calcular_cargo


def imprimir_resultado(resultado):
    print("\n========== RESULTADO DO CÁLCULO ==========\n")

    for nome_modulo, dados in resultado["modulos"].items():
        print(f"\n{nome_modulo}")
        print("-" * len(nome_modulo))

        for item, valor in dados["itens"].items():
            print(f"{item:25} -> R$ {valor:10.2f}")

        print(f"TOTAL DO MÓDULO:        R$ {dados['total_modulo']:10.2f}")

    print("\n==========================================")
    print(f"TOTAL UNITÁRIO:          R$ {resultado['total_unitario']:10.2f}")
    print(f"TOTAL MENSAL:            R$ {resultado['total_mensal']:10.2f}")
    print("==========================================\n")
# -------------------
# MÓDULO 1 – REMUNERAÇÃO
# -------------------
modulo1 = Modulo(
    nome="MÓDULO 1 – REMUNERAÇÃO",
    itens=[
        ItemCalculo("1", "salario_base", "Salário Base", "valor_fixo", {"valor": 1590}),
        ItemCalculo("2", "total_remuneracao", "Total Remuneração", "soma", {
            "base": ["salario_base"]
        }),
    ],
    id_total="total_remuneracao"
)

# -------------------
# MÓDULO 2.1 – PROVISÕES
# -------------------
modulo21 = Modulo(
    nome="MÓDULO 2.1 – PROVISÕES",
    itens=[
        ItemCalculo("A0", "fracao_decimo", "1/12", "valor_fixo", {"valor": 1/12}),

        ItemCalculo("A", "decimo_terceiro", "13º Salário", "multiplicacao", {
            "base": ["total_remuneracao", "fracao_decimo"]
        }),
        ItemCalculo("B", "ferias", "Férias + 1/3", "percentual", {
            "percentual": 12.10,
            "base": ["total_remuneracao"]
        }),
        ItemCalculo("T", "total_21", "Total 2.1", "soma", {
            "base": ["decimo_terceiro", "ferias"]
        }),
    ],
    id_total="total_21"
)

# -------------------
# MÓDULO 2.2 – ENCARGOS
# -------------------
modulo22 = Modulo(
    nome="MÓDULO 2.2 – ENCARGOS",
    itens=[

        # Percentuais
        ItemCalculo("P1", "perc_inss", "Percentual INSS", "valor_fixo", {"valor": 20.00}),
        ItemCalculo("P2", "perc_salario_educacao", "Percentual Salário Educação", "valor_fixo", {"valor": 2.50}),
        ItemCalculo("P3", "perc_sat", "Percentual SAT", "valor_fixo", {"valor": 1.00}),
        ItemCalculo("P4", "perc_sesc", "Percentual SESC/SESI", "valor_fixo", {"valor": 1.50}),
        ItemCalculo("P5", "perc_senai", "Percentual SENAI/SENAC", "valor_fixo", {"valor": 1.00}),
        ItemCalculo("P6", "perc_sebrae", "Percentual SEBRAE", "valor_fixo", {"valor": 0.60}),
        ItemCalculo("P7", "perc_incra", "Percentual INCRA", "valor_fixo", {"valor": 0.20}),
        ItemCalculo("P8", "perc_fgts", "Percentual FGTS", "valor_fixo", {"valor": 8.00}),

        # Soma dinâmica dos percentuais
        ItemCalculo("PT", "percentual_total_22", "Percentual Total 2.2", "soma", {
            "base": [
                "perc_inss",
                "perc_salario_educacao",
                "perc_sat",
                "perc_sesc",
                "perc_senai",
                "perc_sebrae",
                "perc_incra",
                "perc_fgts"
            ]
        }),

        # Valores calculados
        ItemCalculo("A", "inss", "INSS", "percentual", {
            "percentual_base": "perc_inss",
            "base": ["total_remuneracao","total_21"]
        }),

        ItemCalculo("B", "salario_educacao", "Salário Educação", "percentual", {
            "percentual_base": "perc_salario_educacao",
            "base": ["total_remuneracao","total_21"]
        }),

        ItemCalculo("C", "sat", "SAT", "percentual", {
            "percentual_base": "perc_sat",
            "base": ["total_remuneracao","total_21"]
        }),

        ItemCalculo("D", "sesc_sesi", "SESC/SESI", "percentual", {
            "percentual_base": "perc_sesc",
            "base": ["total_remuneracao","total_21"]
        }),

        ItemCalculo("E", "senai_senac", "SENAI/SENAC", "percentual", {
            "percentual_base": "perc_senai",
            "base": ["total_remuneracao","total_21"]
        }),

        ItemCalculo("F", "sebrae", "SEBRAE", "percentual", {
            "percentual_base": "perc_sebrae",
            "base": ["total_remuneracao","total_21"]
        }),

        ItemCalculo("G", "incra", "INCRA", "percentual", {
            "percentual_base": "perc_incra",
            "base": ["total_remuneracao","total_21"]
        }),

        ItemCalculo("H", "fgts", "FGTS", "percentual", {
            "percentual_base": "perc_fgts",
            "base": ["total_remuneracao","total_21"]
        }),

        ItemCalculo("T", "total_22", "Total 2.2", "soma", {
            "base": [
                "inss", "salario_educacao", "sat",
                "sesc_sesi", "senai_senac",
                "sebrae", "incra", "fgts"
            ]
        }),
    ],
    id_total="total_22"
)

# -------------------
# MÓDULO 2.3 – BENEFÍCIOS
# -------------------
modulo23 = Modulo(
    nome="MÓDULO 2.3 – BENEFÍCIOS",
    itens=[
        # VT
        ItemCalculo("A1", "valor_vt_unit", "Valor Unitário VT", "valor_fixo", {"valor": 3.80}),
        ItemCalculo("A2", "passagens_dia", "Passagens por dia", "valor_fixo", {"valor": 2}),
        ItemCalculo("A3", "dias_vt", "Dias VT", "valor_fixo", {"valor": 22}),

        ItemCalculo("A4", "vt_bruto", "VT Bruto", "multiplicacao", {
            "base": ["valor_vt_unit", "passagens_dia", "dias_vt"]
        }),

        ItemCalculo("A5", "desconto_vt", "Desconto VT 6%", "percentual", {
            "percentual": 6,
            "base": ["salario_base"]
        }),

        ItemCalculo("A6", "aux_transporte", "Auxílio Transporte", "subtracao", {
            "base": ["vt_bruto", "desconto_vt"]
        }),

        # VR
        ItemCalculo("B1", "aux_ref_unit", "Valor Unitário VR", "valor_fixo", {"valor": 18.45}),
        ItemCalculo("B2", "dias_vr", "Dias VR", "valor_fixo", {"valor": 22}),
        ItemCalculo("B3", "aux_refeicao", "Auxílio Refeição", "multiplicacao", {
            "base": ["aux_ref_unit", "dias_vr"]
        }),

        # Outros fixos
        ItemCalculo("C1", "cesta_basica", "Cesta Básica", "valor_fixo", {"valor": 137.79}),
        ItemCalculo("C2", "beneficio_social", "Benefício Social", "valor_fixo", {"valor": 15.20}),
        ItemCalculo("C3", "aux_saude", "Auxílio Saúde", "valor_fixo", {"valor": 33.65}),

        ItemCalculo("T", "total_23", "Total 2.3", "soma", {
            "base": [
                "aux_transporte",
                "aux_refeicao",
                "cesta_basica",
                "beneficio_social",
                "aux_saude"
            ]
        }),
    ],
    id_total="total_23"
)

modulo3 = Modulo(
    nome="MÓDULO 3 – PROVISÃO PARA RESCISÃO",
    itens=[

        # A – Aviso Prévio Indenizado
        ItemCalculo("A0", "frac_mes", "1/12", "valor_fixo", {"valor": 1/12}),
        ItemCalculo("A1", "perc_aviso", "5%", "valor_fixo", {"valor": 5}),
        ItemCalculo("A2", "perc_aviso_mensal", "Percentual Aviso Mensal", "multiplicacao", {
            "base": ["frac_mes", "perc_aviso"]
        }),
        ItemCalculo("A3", "aviso_indenizado", "Aviso Indenizado", "percentual", {
            "percentual_base": "perc_aviso_mensal",
            "base": ["total_remuneracao"]
        }),

        # B – Incidência FGTS sobre Aviso Indenizado (8%)
        ItemCalculo("B", "fgts_aviso_indenizado", "FGTS sobre Aviso Indenizado", "percentual", {
            "percentual": 8.00,
            "base": ["aviso_indenizado"]
        }),

        # C – Multa 2% sobre FGTS e contribuições
        ItemCalculo("C", "multa_fgts_indenizado", "Multa FGTS Aviso Indenizado", "percentual", {
            "percentual": 2.00,
            "base": ["total_remuneracao"]  # submódulo 2.2
        }),

        # D – Aviso Prévio Trabalhado
        ItemCalculo("D", "aviso_trabalhado", "Aviso Prévio Trabalhado", "percentual", {
            "percentual": 1.94,
            "base": ["total_remuneracao"]
        }),

        # E – Incidência encargos 2.2 sobre Aviso Trabalhado
        ItemCalculo("E", "encargos_aviso_trabalhado", "Encargos sobre Aviso Trabalhado", "percentual", {
            "percentual_base": "percentual_total_22",
            "base": ["aviso_trabalhado"]
        }),

        # F – Multa 2%
        ItemCalculo("F", "multa_fgts_trabalhado", "Multa FGTS Aviso Trabalhado", "percentual", {
            "percentual": 2.00,
            "base": ["total_remuneracao"]
        }),

        # Total Módulo 3
        ItemCalculo("T", "total_3", "Total Módulo 3", "soma", {
            "base": [
                "aviso_indenizado",
                "fgts_aviso_indenizado",
                "multa_fgts_indenizado",
                "aviso_trabalhado",
                "encargos_aviso_trabalhado",
                "multa_fgts_trabalhado"
            ]
        }),
    ],
    id_total="total_3"
)

modulo4 = Modulo(
    nome="MÓDULO 4 – CUSTO DE REPOSIÇÃO",
    itens=[

        # ------------------------
        # 4.1 – AUSÊNCIAS LEGAIS
        # ------------------------

        # Percentuais
        ItemCalculo("P1", "perc_ferias_41", "Percentual Férias", "valor_fixo", {"valor": 0.93}),
        ItemCalculo("P2", "perc_ausencias_legais", "Percentual Ausências Legais", "valor_fixo", {"valor": 0.68}),
        ItemCalculo("P3", "perc_licenca_paternidade", "Percentual Licença Paternidade", "valor_fixo", {"valor": 0.02}),
        ItemCalculo("P4", "perc_acidente_trabalho", "Percentual Acidente Trabalho", "valor_fixo", {"valor": 0.03}),
        ItemCalculo("P5", "perc_maternidade", "Percentual Afastamento Maternidade", "valor_fixo", {"valor": 0.02}),
        ItemCalculo("P6", "perc_aux_doenca", "Percentual Auxílio Doença", "valor_fixo", {"valor": 1.39}),
        ItemCalculo("P7", "perc_outros_41", "Percentual Outros", "valor_fixo", {"valor": 0.00}),

        # Valores calculados
        ItemCalculo("A", "ferias_41", "Férias", "percentual", {
            "percentual_base": "perc_ferias_41",
            "base": ["total_remuneracao"]
        }),

        ItemCalculo("B", "ausencias_legais", "Ausências Legais", "percentual", {
            "percentual_base": "perc_ausencias_legais",
            "base": ["total_remuneracao"]
        }),

        ItemCalculo("C", "licenca_paternidade", "Licença Paternidade", "percentual", {
            "percentual_base": "perc_licenca_paternidade",
            "base": ["total_remuneracao"]
        }),

        ItemCalculo("D", "acidente_trabalho", "Acidente de Trabalho", "percentual", {
            "percentual_base": "perc_acidente_trabalho",
            "base": ["total_remuneracao"]
        }),

        ItemCalculo("E", "afastamento_maternidade", "Afastamento Maternidade", "percentual", {
            "percentual_base": "perc_maternidade",
            "base": ["total_remuneracao"]
        }),

        ItemCalculo("F", "auxilio_doenca", "Auxílio Doença", "percentual", {
            "percentual_base": "perc_aux_doenca",
            "base": ["total_remuneracao"]
        }),

        ItemCalculo("G", "outros_41", "Outros", "percentual", {
            "percentual_base": "perc_outros_41",
            "base": ["total_remuneracao"]
        }),

        ItemCalculo("T1", "total_41", "Total 4.1", "soma", {
            "base": [
                "ferias_41",
                "ausencias_legais",
                "licenca_paternidade",
                "acidente_trabalho",
                "afastamento_maternidade",
                "auxilio_doenca",
                "outros_41"
            ]
        }),

        # ------------------------
        # 4.2 – INTRAJORNADA
        # ------------------------

        ItemCalculo("I1", "intrajornada", "Intervalo Intrajornada", "valor_fixo", {"valor": 0.00}),

        ItemCalculo("T2", "total_42", "Total 4.2", "soma", {
            "base": ["intrajornada"]
        }),

        # ------------------------
        # TOTAL MÓDULO 4
        # ------------------------

        ItemCalculo("TT", "total_4", "Total Módulo 4", "soma", {
            "base": ["total_41", "total_42"]
        }),
    ],
    id_total="total_4"
)
modulo5 = Modulo(
    nome="MÓDULO 5 – INSUMOS DIVERSOS",
    itens=[

        ItemCalculo("A", "uniformes", "Uniformes", "valor_fixo", {"valor": 39.32}),
        ItemCalculo("B", "materiais", "Materiais/Utensílios", "valor_fixo", {"valor": 611.58}),
        ItemCalculo("C", "equipamentos", "Equipamentos", "valor_fixo", {"valor": 23.75}),
        ItemCalculo("D", "utensilios", "Utensílios", "valor_fixo", {"valor": 0.00}),

        ItemCalculo("T", "total_5", "Total Módulo 5", "soma", {
            "base": [
                "uniformes",
                "materiais",
                "equipamentos",
                "utensilios"
            ]
        }),
    ],
    id_total="total_5"
)

modulo6 = Modulo(
    nome="MÓDULO 6 – CUSTOS INDIRETOS, TRIBUTOS E LUCRO",
    itens=[

        # ----------------------------
        # BASE INICIAL (M1–M5)
        # ----------------------------
        ItemCalculo("B0", "base_inicial", "Base Inicial", "soma", {
            "base": [
                "total_remuneracao",
                "total_21",
                "total_22",
                "total_23",
                "total_3",
                "total_4",
                "total_5"
            ]
        }),

        # ----------------------------
        # CUSTOS INDIRETOS
        # ----------------------------
        ItemCalculo("A", "custos_indiretos", "Custos Indiretos", "percentual_truncado", {
            "percentual": 1.62,
            "base": ["base_inicial"]
        }),

        # ----------------------------
        # BASE LUCRO
        # ----------------------------
        ItemCalculo("B1", "base_lucro", "Base Lucro", "soma", {
            "base": ["base_inicial", "custos_indiretos"]
        }),

        # ----------------------------
        # LUCRO
        # ----------------------------
        ItemCalculo("B", "lucro", "Lucro", "percentual_truncado", {
            "percentual": 2.00,
            "base": ["base_lucro"]
        }),

        # ----------------------------
        # BASE INCIDÊNCIA TRIBUTOS
        # ----------------------------
        ItemCalculo("B2", "base_incidencia", "Base Incidência", "soma", {
            "base": ["base_inicial", "custos_indiretos", "lucro"]
        }),

        # ----------------------------
        # PERCENTUAIS TRIBUTOS
        # ----------------------------
        ItemCalculo("P1", "perc_pis_cofins", "Percentual PIS/COFINS", "valor_fixo", {"valor": 3.99}),
        ItemCalculo("P2", "perc_iss", "Percentual ISS", "valor_fixo", {"valor": 2.00}),

        ItemCalculo("PT", "perc_total_tributos", "Percentual Total Tributos", "soma", {
            "base": ["perc_pis_cofins", "perc_iss"]
        }),

        # ----------------------------
        # SUBTOTAL POR DENTRO
        # subtotal = base / (1 - percentual_total)
        # ----------------------------
        ItemCalculo("B3", "subtotal_com_tributos", "Subtotal com Tributos", "por_dentro_base", {
            "percentual_base": "perc_total_tributos",
            "base": ["base_incidencia"]
        }),

        # ----------------------------
        # TRIBUTOS INDIVIDUAIS
        # ----------------------------
        ItemCalculo("C1", "pis_cofins", "PIS/COFINS", "percentual_truncado", {
            "percentual_base": "perc_pis_cofins",
            "base": ["subtotal_com_tributos"]
        }),

        ItemCalculo("C2", "iss", "ISS", "percentual_truncado", {
            "percentual_base": "perc_iss",
            "base": ["subtotal_com_tributos"]
        }),

        # ----------------------------
        # TOTAL TRIBUTOS
        # ----------------------------
        ItemCalculo("CT", "total_tributos", "Total Tributos", "soma", {
            "base": ["pis_cofins", "iss"]
        }),

        # ----------------------------
        # TOTAL MÓDULO 6
        # ----------------------------
        ItemCalculo("T", "total_6", "Total Módulo 6", "soma", {
            "base": ["custos_indiretos", "lucro", "total_tributos"]
        }),
    ],
    id_total="total_6"
)

cargo = Cargo("Servente", 1, [modulo1, modulo21, modulo22, modulo23,modulo3,modulo4,modulo5,modulo6])

resultado = calcular_cargo(cargo)

imprimir_resultado(resultado)