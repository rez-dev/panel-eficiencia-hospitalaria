import React, { createContext, useContext, useReducer } from "react";

// Estado inicial
const initialState = {
  // Parámetros de cálculo
  inputcols: ["bienesyservicios", "remuneraciones"],
  outputcols: ["consultas", "grdxegresos"],
  año: 2023,
  metodologia: "DEA",

  // Datos calculados
  hospitales: [],
  kpis: [],

  // Resultados completos de eficiencia por metodología
  resultadosEficiencia: {
    SFA: null,
    DEA: null,
    DEAM: null, // DEA-Malmquist
  },

  // Resultados de comparación
  resultadosComparacion: {},
  // Resultados de determinantes
  resultadosDeterminantes: {},
  // Resultados de PCA/Clustering
  resultadosPcaCluster: {},

  // Selecciones para comparación
  hospitalesSeleccionados: [],

  // Datos para comparación temporal (mismo hospital, diferentes años)
  hospitalTemporalData: {
    yearA: null, // Datos del hospital para año A
    yearB: null, // Datos del hospital para año B
    yearASelected: null, // Año seleccionado para A
    yearBSelected: null, // Año seleccionado para B
    loading: false, // Estado de carga para datos temporales
    error: null, // Error específico para datos temporales
  },

  // Estados de control
  isDataLoaded: false,
  loading: false,
  error: null,
};

// Tipos de acciones
const actionTypes = {
  SET_INPUT_COLS: "SET_INPUT_COLS",
  SET_OUTPUT_COLS: "SET_OUTPUT_COLS",
  SET_AÑO: "SET_AÑO",
  SET_METODOLOGIA: "SET_METODOLOGIA",
  SET_HOSPITALES: "SET_HOSPITALES",
  SET_KPIS: "SET_KPIS",
  SET_HOSPITALES_SELECCIONADOS: "SET_HOSPITALES_SELECCIONADOS",
  ADD_HOSPITAL_SELECCIONADO: "ADD_HOSPITAL_SELECCIONADO",
  REMOVE_HOSPITAL_SELECCIONADO: "REMOVE_HOSPITAL_SELECCIONADO",
  CLEAR_HOSPITALES_SELECCIONADOS: "CLEAR_HOSPITALES_SELECCIONADOS",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  RESET_STATE: "RESET_STATE",
  // Acciones para datos temporales
  SET_TEMPORAL_YEAR_A: "SET_TEMPORAL_YEAR_A",
  SET_TEMPORAL_YEAR_B: "SET_TEMPORAL_YEAR_B",
  SET_TEMPORAL_LOADING: "SET_TEMPORAL_LOADING",
  SET_TEMPORAL_ERROR: "SET_TEMPORAL_ERROR",
  CLEAR_TEMPORAL_DATA: "CLEAR_TEMPORAL_DATA",
  SET_TEMPORAL_YEAR_A_SELECTED: "SET_TEMPORAL_YEAR_A_SELECTED",
  SET_TEMPORAL_YEAR_B_SELECTED: "SET_TEMPORAL_YEAR_B_SELECTED",
  // Acciones para resultados completos de eficiencia
  SET_RESULTADO_SFA: "SET_RESULTADO_SFA",
  SET_RESULTADO_DEA: "SET_RESULTADO_DEA",
  SET_RESULTADO_DEAM: "SET_RESULTADO_DEAM",
  // Acciones para resultados de comparación
  SET_RESULTADOS_COMPARACION: "SET_RESULTADOS_COMPARACION",
  CLEAR_RESULTADOS_COMPARACION: "CLEAR_RESULTADOS_COMPARACION",
  // Acciones para resultados de determinantes
  SET_RESULTADOS_DETERMINANTES: "SET_RESULTADOS_DETERMINANTES",
  CLEAR_RESULTADOS_DETERMINANTES: "CLEAR_RESULTADOS_DETERMINANTES",
  // Acciones para resultados de PCA/Clustering
  SET_RESULTADOS_PCA_CLUSTER: "SET_RESULTADOS_PCA_CLUSTER",
  CLEAR_RESULTADOS_PCA_CLUSTER: "CLEAR_RESULTADOS_PCA_CLUSTER",
};

// Reducer para manejar el estado
const globalStateReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_INPUT_COLS:
      return { ...state, inputcols: action.payload };

    case actionTypes.SET_OUTPUT_COLS:
      return { ...state, outputcols: action.payload };

    case actionTypes.SET_AÑO:
      return { ...state, año: action.payload };

    case actionTypes.SET_METODOLOGIA:
      return { ...state, metodologia: action.payload };

    case actionTypes.SET_HOSPITALES:
      return { ...state, hospitales: action.payload, isDataLoaded: true };

    case actionTypes.SET_KPIS:
      return { ...state, kpis: action.payload };

    case actionTypes.SET_HOSPITALES_SELECCIONADOS:
      return { ...state, hospitalesSeleccionados: action.payload };

    case actionTypes.ADD_HOSPITAL_SELECCIONADO:
      return {
        ...state,
        hospitalesSeleccionados: [
          ...state.hospitalesSeleccionados,
          action.payload,
        ],
      };

    case actionTypes.REMOVE_HOSPITAL_SELECCIONADO:
      return {
        ...state,
        hospitalesSeleccionados: state.hospitalesSeleccionados.filter(
          (hospital) => hospital.id !== action.payload
        ),
      };

    case actionTypes.CLEAR_HOSPITALES_SELECCIONADOS:
      return {
        ...state,
        hospitalesSeleccionados: [],
      };
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case actionTypes.RESET_STATE:
      return { ...initialState, año: 2023 };

    // Casos para datos temporales
    case actionTypes.SET_TEMPORAL_YEAR_A:
      return {
        ...state,
        hospitalTemporalData: {
          ...state.hospitalTemporalData,
          yearA: action.payload,
        },
      };

    case actionTypes.SET_TEMPORAL_YEAR_B:
      return {
        ...state,
        hospitalTemporalData: {
          ...state.hospitalTemporalData,
          yearB: action.payload,
        },
      };

    case actionTypes.SET_TEMPORAL_LOADING:
      return {
        ...state,
        hospitalTemporalData: {
          ...state.hospitalTemporalData,
          loading: action.payload,
        },
      };

    case actionTypes.SET_TEMPORAL_ERROR:
      return {
        ...state,
        hospitalTemporalData: {
          ...state.hospitalTemporalData,
          error: action.payload,
          loading: false,
        },
      };

    case actionTypes.CLEAR_TEMPORAL_DATA:
      return {
        ...state,
        hospitalTemporalData: {
          yearA: null,
          yearB: null,
          loading: false,
          error: null,
        },
      };

    case actionTypes.SET_TEMPORAL_YEAR_A_SELECTED:
      return {
        ...state,
        hospitalTemporalData: {
          ...state.hospitalTemporalData,
          yearASelected: action.payload,
        },
      };
    case actionTypes.SET_TEMPORAL_YEAR_B_SELECTED:
      return {
        ...state,
        hospitalTemporalData: {
          ...state.hospitalTemporalData,
          yearBSelected: action.payload,
        },
      };

    // Acciones para resultados completos de eficiencia
    case actionTypes.SET_RESULTADO_SFA:
      return {
        ...state,
        resultadosEficiencia: {
          ...state.resultadosEficiencia,
          SFA: action.payload,
        },
      };
    case actionTypes.SET_RESULTADO_DEA:
      return {
        ...state,
        resultadosEficiencia: {
          ...state.resultadosEficiencia,
          DEA: action.payload,
        },
      };
    case actionTypes.SET_RESULTADO_DEAM:
      return {
        ...state,
        resultadosEficiencia: {
          ...state.resultadosEficiencia,
          DEAM: action.payload,
        },
      };
    // Acciones para resultados de comparación
    case actionTypes.SET_RESULTADOS_COMPARACION:
      return {
        ...state,
        resultadosComparacion: action.payload,
      };
    case actionTypes.CLEAR_RESULTADOS_COMPARACION:
      return {
        ...state,
        resultadosComparacion: {},
      };
    // Acciones para resultados de determinantes
    case actionTypes.SET_RESULTADOS_DETERMINANTES:
      return {
        ...state,
        resultadosDeterminantes: action.payload,
      };
    case actionTypes.CLEAR_RESULTADOS_DETERMINANTES:
      return {
        ...state,
        resultadosDeterminantes: {},
      };
    // Acciones para resultados de PCA/Clustering
    case actionTypes.SET_RESULTADOS_PCA_CLUSTER:
      return {
        ...state,
        resultadosPcaCluster: action.payload,
      };
    case actionTypes.CLEAR_RESULTADOS_PCA_CLUSTER:
      return {
        ...state,
        resultadosPcaCluster: {},
      };

    default:
      return state;
  }
};

// Crear el contexto
const GlobalStateContext = createContext();

// Hook personalizado para usar el contexto
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error(
      "useGlobalState debe ser usado dentro de un GlobalStateProvider"
    );
  }
  return context;
};

// Provider del contexto
export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalStateReducer, initialState);

  // Acciones básicas
  const setInputCols = (cols) => {
    dispatch({ type: actionTypes.SET_INPUT_COLS, payload: cols });
  };

  const setOutputCols = (cols) => {
    dispatch({ type: actionTypes.SET_OUTPUT_COLS, payload: cols });
  };

  const setAño = (año) => {
    dispatch({ type: actionTypes.SET_AÑO, payload: año });
  };

  const setMetodologia = (metodologia) => {
    dispatch({ type: actionTypes.SET_METODOLOGIA, payload: metodologia });
  };

  const setHospitales = (hospitales) => {
    dispatch({ type: actionTypes.SET_HOSPITALES, payload: hospitales });
  };

  const setKpis = (kpis) => {
    dispatch({ type: actionTypes.SET_KPIS, payload: kpis });
  };

  const setHospitalesSeleccionados = (hospitales) => {
    dispatch({
      type: actionTypes.SET_HOSPITALES_SELECCIONADOS,
      payload: hospitales,
    });
  };

  const addHospitalSeleccionado = (hospital) => {
    dispatch({
      type: actionTypes.ADD_HOSPITAL_SELECCIONADO,
      payload: hospital,
    });
  };
  const removeHospitalSeleccionado = (hospitalId) => {
    dispatch({
      type: actionTypes.REMOVE_HOSPITAL_SELECCIONADO,
      payload: hospitalId,
    });
  };

  const clearHospitalesSeleccionados = () => {
    dispatch({ type: actionTypes.CLEAR_HOSPITALES_SELECCIONADOS });
  };

  const setLoading = (loading) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: error });
  };
  const resetState = () => {
    dispatch({ type: actionTypes.RESET_STATE });
  };

  // Acciones para datos temporales
  const setTemporalYearA = (data) => {
    dispatch({ type: actionTypes.SET_TEMPORAL_YEAR_A, payload: data });
  };

  const setTemporalYearB = (data) => {
    dispatch({ type: actionTypes.SET_TEMPORAL_YEAR_B, payload: data });
  };

  const setTemporalLoading = (loading) => {
    dispatch({ type: actionTypes.SET_TEMPORAL_LOADING, payload: loading });
  };

  const setTemporalError = (error) => {
    dispatch({ type: actionTypes.SET_TEMPORAL_ERROR, payload: error });
  };

  const clearTemporalData = () => {
    dispatch({ type: actionTypes.CLEAR_TEMPORAL_DATA });
  };

  const setTemporalYearASelected = (year) => {
    dispatch({ type: actionTypes.SET_TEMPORAL_YEAR_A_SELECTED, payload: year });
  };
  const setTemporalYearBSelected = (year) => {
    dispatch({ type: actionTypes.SET_TEMPORAL_YEAR_B_SELECTED, payload: year });
  };

  // Acciones para resultados completos de eficiencia
  const setResultadoSFA = (resultado) => {
    dispatch({ type: actionTypes.SET_RESULTADO_SFA, payload: resultado });
  };
  const setResultadoDEA = (resultado) => {
    dispatch({ type: actionTypes.SET_RESULTADO_DEA, payload: resultado });
  };
  const setResultadoDEAM = (resultado) => {
    dispatch({ type: actionTypes.SET_RESULTADO_DEAM, payload: resultado });
  };

  // Acciones para resultados de comparación
  const setResultadosComparacion = (resultados) => {
    dispatch({
      type: actionTypes.SET_RESULTADOS_COMPARACION,
      payload: resultados,
    });
  };
  const clearResultadosComparacion = () => {
    dispatch({ type: actionTypes.CLEAR_RESULTADOS_COMPARACION });
  };

  // Acciones para resultados de determinantes
  const setResultadosDeterminantes = (resultados) => {
    dispatch({
      type: actionTypes.SET_RESULTADOS_DETERMINANTES,
      payload: resultados,
    });
  };
  const clearResultadosDeterminantes = () => {
    dispatch({ type: actionTypes.CLEAR_RESULTADOS_DETERMINANTES });
  };

  // Acciones para resultados de PCA/Clustering
  const setResultadosPcaCluster = (resultados) => {
    dispatch({
      type: actionTypes.SET_RESULTADOS_PCA_CLUSTER,
      payload: resultados,
    });
  };
  const clearResultadosPcaCluster = () => {
    dispatch({ type: actionTypes.CLEAR_RESULTADOS_PCA_CLUSTER });
  };

  const value = {
    state,
    actions: {
      setInputCols,
      setOutputCols,
      setAño,
      setMetodologia,
      setHospitales,
      setKpis,
      setHospitalesSeleccionados,
      addHospitalSeleccionado,
      removeHospitalSeleccionado,
      clearHospitalesSeleccionados,
      setLoading,
      setError,
      resetState,
      // Acciones temporales
      setTemporalYearA,
      setTemporalYearB,
      setTemporalLoading,
      setTemporalError,
      clearTemporalData,
      setTemporalYearASelected,
      setTemporalYearBSelected,
      // Acciones para resultados completos de eficiencia
      setResultadoSFA,
      setResultadoDEA,
      setResultadoDEAM,
      // Acciones para resultados de comparación
      setResultadosComparacion,
      clearResultadosComparacion,
      // Acciones para resultados de determinantes
      setResultadosDeterminantes,
      clearResultadosDeterminantes,
      // Acciones para resultados de PCA/Clustering
      setResultadosPcaCluster,
      clearResultadosPcaCluster,
    },
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateContext;
