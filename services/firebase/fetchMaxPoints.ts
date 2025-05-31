import { db } from './firebase.config';
import { collection, query, where, getDocs, doc, onSnapshot, Unsubscribe } from 'firebase/firestore';

interface Produto {
  pontos: number;
  empresaId: string;
}

export const calcularMaximoPontosPorDia = async (empresaId: string): Promise<number> => {
  try {
    // Buscar todos os produtos da empresa
    const produtosQuery = query(
      collection(db, "loja"),
      where("empresaId", "==", empresaId)
    );

    const querySnapshot = await getDocs(produtosQuery);
    const produtos = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as unknown as Produto[];

    // Calcular o somatório total dos pontos
    const somatorioTotal = produtos.reduce((total, produto) => total + produto.pontos, 0);

    // Dividir por 29 dias para obter o máximo diário
    const maximoDiario = Math.floor(somatorioTotal / 29);

    return maximoDiario;
  } catch (error) {
    console.error("Erro ao calcular máximo de pontos por dia:", error);
    throw error;
  }
};

export const calcularMaximoPontosPorFeedback = async (empresaId: string): Promise<number> => {
  try {
    // Primeiro calcula o máximo diário
    const maximoDiario = await calcularMaximoPontosPorDia(empresaId);
    
    // Divide por 5 para obter o máximo por feedback
    // Isso significa que o usuário pode dar 5 feedbacks por dia
    const maximoPorFeedback = Math.floor(maximoDiario / 5);
    
    return maximoPorFeedback;
  } catch (error) {
    console.error("Erro ao calcular máximo de pontos por feedback:", error);
    throw error;
  }
};

export const observarPontosUsuario = (userId: string, callback: (pontos: number) => void): Unsubscribe | undefined => {
  try {
    const userRef = doc(db, "users", userId);
    
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const pontos = userData.pontos || 0;
        callback(pontos);
      }
    }, (error) => {
      console.error("Erro ao observar pontos do usuário:", error);
    });
  } catch (error) {
    console.error("Erro ao configurar observador de pontos:", error);
    return undefined;
  }
}; 