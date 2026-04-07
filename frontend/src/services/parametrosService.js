export function extrairParametrosAgrupados(estrutura) {

  function mapearItem(item) {

    if (item.tipo === "parametro") {
      return {
        chave: item.id_tecnico,
        nome: item.descricao,
        tipo: "numero"
      };
    }

    if (item.tipo === "percentual_parametrizado") {
      return {
        chave: item.parametro,
        nome: item.descricao,
        tipo: "percentual"
      };
    }

    return null;
  }

  return estrutura.modulos?.map(modulo => {

    const itensModulo = (modulo.itens || [])
      .map(mapearItem)
      .filter(Boolean);

    const submodulos = modulo.submodulos?.map(sub => ({
      nome: sub.nome,
      itens: (sub.itens || [])
        .map(mapearItem)
        .filter(Boolean)
    }));

    return {
      nome: modulo.nome,
      itens: itensModulo,
      submodulos: submodulos || []
    };

  });
}