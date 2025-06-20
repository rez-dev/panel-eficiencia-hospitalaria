import React, { createContext, useContext, useReducer } from "react";

// Estado inicial
const initialState = {
  // Parámetros de cálculo
  inputcols: [],
  outputcols: [],
  año: new Date().getFullYear(),
  metodologia: "DEA",

  // Datos calculados
  hospitales: [],
  kpis: [],

  // Selecciones para comparación
  hospitalesSeleccionados: [],

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
      return { ...initialState, año: new Date().getFullYear() };

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
    },
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateContext;
