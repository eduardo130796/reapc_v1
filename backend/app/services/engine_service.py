from app.services.engine_v2 import calcular_pcfp_v2

def executar_calculo(estrutura, parametros):

    resultado = calcular_pcfp_v2(estrutura, parametros)

    return resultado