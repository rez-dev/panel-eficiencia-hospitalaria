import React, { useState, useEffect, useMemo } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EditFilled,
  SettingFilled,
  TrophyOutlined,
  LineChartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Layout,
  theme,
  Button,
  Select,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Radio,
  Input,
  Space,
  Empty,
  Alert,
  Spin,
} from "antd";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Importar componentes personalizados
import StateIndicator from "./StateIndicator";
import { useGlobalState } from "../contexts/GlobalStateContext";
import ApiService from "../services/api";
import CustomTooltip from "./CustomTooltip";
import { getTooltip } from "../data/tooltips";

// Helper component para tooltips de encabezados
const SectionTooltip = ({ children, tooltipData }) => {
  if (!tooltipData) return children;
  return (
    <CustomTooltip
      title={tooltipData.title}
      content={tooltipData.content}
      details={tooltipData.details}
    >
      {children}
    </CustomTooltip>
  );
};

// Helper component para tooltips de parámetros
const ParameterTooltip = ({ children, tooltipData }) => {
  if (!tooltipData) return children;
  return (
    <CustomTooltip
      title={tooltipData.title}
      content={tooltipData.content}
      details={tooltipData.details}
      options={tooltipData.options}
    >
      {children}
    </CustomTooltip>
  );
};

// Helper component para tooltips de KPIs
const KpiTooltip = ({ children, tooltipData }) => {
  if (!tooltipData) return children;
  return (
    <CustomTooltip title={tooltipData.title} content={tooltipData.content}>
      {children}
    </CustomTooltip>
  );
};

// Componente de leyenda personalizado para Leaflet
const MapLegend = () => {
  const map = useMap();

  React.useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "legend");
      div.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
      div.style.padding = "12px";
      div.style.borderRadius = "8px";
      div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
      div.style.fontSize = "12px";
      div.style.lineHeight = "1.4";
      div.style.maxWidth = "200px";
      div.style.border = "1px solid #d9d9d9";

      div.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 13px; color: #333;">
          📍 Leyenda
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: #52c41a;
            margin-right: 8px;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          "></div>
          <span style="color: #666; font-size: 11px;">Alta eficiencia (≥90%)</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: #1890ff;
            margin-right: 8px;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          "></div>
          <span style="color: #666; font-size: 11px;">Eficiencia media (80-89%)</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background-color: #fa8c16;
            margin-right: 8px;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          "></div>
          <span style="color: #666; font-size: 11px;">Eficiencia baja (&lt;80%)</span>
        </div>
      `;

      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
};

const { Content, Sider } = Layout;
const { Title } = Typography;

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Iconos personalizados por eficiencia
const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const highEfficiencyIcon = createCustomIcon("#52c41a");
const mediumEfficiencyIcon = createCustomIcon("#1890ff");
const lowEfficiencyIcon = createCustomIcon("#fa8c16");

const ComparacionView = () => {
  // Contexto global
  const { state, actions } = useGlobalState();
  const {
    inputcols,
    outputcols,
    año: selectedYear,
    metodologia: calculationMethod,
    hospitalesSeleccionados,
    hospitalTemporalData,
    loading,
    error,
  } = state;

  // Estados locales (mantener algunos para funcionalidad específica de esta vista)
  const [collapsed, setCollapsed] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [hospitalAYear, setHospitalAYear] = useState(2018);
  const [hospitalBYear, setHospitalBYear] = useState(2014); // Preparar hospitales para comparación usando el estado global
  const hospitalsToCompare = () => {
    if (hospitalesSeleccionados && hospitalesSeleccionados.length > 0) {
      // Buscar los valores actualizados de eficiencia en state.hospitales si están disponibles
      const getUpdatedHospital = (selectedHospital) => {
        if (state.hospitales && state.hospitales.length > 0) {
          console.log(
            "Buscando actualización para:",
            selectedHospital.hospital
          );
          console.log(
            "Datos disponibles en state.hospitales:",
            state.hospitales.map((h) => h.hospital || h.nombre || h.name)
          );
          console.log(
            "Keys disponibles:",
            state.hospitales.map((h) => h.key || h.id)
          );
          // Buscar el hospital en los datos recalculados por nombre o ID
          const updatedHospital = state.hospitales.find((h) => {
            // Comparar por diferentes campos de nombre
            const hospitalName = selectedHospital.hospital;
            const matchByName =
              h.hospital_name === hospitalName ||
              h.hospital === hospitalName ||
              h.nombre === hospitalName ||
              h.name === hospitalName;

            // Comparar por ID/key
            const matchById =
              h.id === selectedHospital.id ||
              h.key === selectedHospital.key ||
              h.key === selectedHospital.id ||
              h.id === selectedHospital.key;

            return matchByName || matchById;
          });
          if (updatedHospital) {
            console.log(`Hospital ${selectedHospital.hospital} actualizado:`, {
              old: selectedHospital.eficiencia,
              new: updatedHospital.eficiencia,
              rawData: updatedHospital,
            });

            // Calcular eficiencia como se hace en EficienciaView
            const eficienciaField =
              calculationMethod === "SFA" ? "ET SFA" : "ET DEA";
            const eficiencia = updatedHospital[eficienciaField] || 0;
            const eficienciaFormatted = (eficiencia * 100).toFixed(1);

            // Combinar datos del hospital seleccionado con los valores actualizados
            return {
              ...selectedHospital,
              eficiencia: eficienciaFormatted,
              percentil:
                updatedHospital.percentil || selectedHospital.percentil,
              // Mantener otros datos que puedan haberse actualizado
              region: updatedHospital.region || selectedHospital.region,
              lat: updatedHospital.latitud || selectedHospital.lat,
              lng: updatedHospital.longitud || selectedHospital.lng,
              // Agregar datos originales
              ...updatedHospital,
            };
          }
        }
        // Si no se encuentra actualización, devolver el hospital original
        console.log(
          `Hospital ${selectedHospital.hospital} sin actualización disponible`
        );
        return selectedHospital;
      };
      if (hospitalesSeleccionados.length === 1) {
        // Comparación temporal: mismo hospital, diferentes años
        const baseHospital = hospitalesSeleccionados[0];

        // Hospital Año A: usar datos temporales si están disponibles, sino usar datos base
        const hospitalYearA = hospitalTemporalData.yearA || {
          ...baseHospital,
          año: hospitalAYear,
        };

        // Hospital Año B: usar datos temporales si están disponibles, sino usar datos base
        const hospitalYearB = hospitalTemporalData.yearB || {
          ...baseHospital,
          año: hospitalBYear,
        };

        return [hospitalYearA, hospitalYearB];
      } else {
        // Si hay dos o más, usar los primeros dos con valores actualizados
        return hospitalesSeleccionados.slice(0, 2).map(getUpdatedHospital);
      }
    }
    return [];
  };
  const compareHospitals = hospitalsToCompare();

  // Verificar si estamos comparando el mismo hospital (comparación temporal)
  const isSameHospitalComparison = () => {
    if (hospitalesSeleccionados && hospitalesSeleccionados.length === 1) {
      return true;
    }
    const hospitals = hospitalsToCompare();
    return hospitals.length === 2 && hospitals[0].id === hospitals[1].id;
  };

  const isTemporalComparison = isSameHospitalComparison();

  // Calcular KPIs de comparación usando useMemo para recalcular automáticamente
  const comparisonKPIs = useMemo(() => {
    if (compareHospitals.length < 2) {
      return {
        insumoGap: 0,
        salidaGap: 0,
        eficienciaGap: 0,
      };
    }
    const hospital1 = compareHospitals[0];
    const hospital2 = compareHospitals[1];

    // Si es el mismo hospital (comparación temporal), calcular los gaps temporales
    if (hospital1.id === hospital2.id || hospital1.key === hospital2.key) {
      // En comparación temporal, los gaps representan la diferencia entre años
      // Calcular Gap de Eficiencia temporal
      const eficiencia1 = parseFloat(hospital1.eficiencia) || 0;
      const eficiencia2 = parseFloat(hospital2.eficiencia) || 0;
      const eficienciaGap = Math.abs(eficiencia1 - eficiencia2);

      // Calcular Gap de Insumos temporal
      let insumoGap = 0;
      let maxInsumoVariable = "";
      if (inputcols.length > 0) {
        const insumoGaps = inputcols.map((col) => {
          const val1 = parseFloat(hospital1[col]) || 0;
          const val2 = parseFloat(hospital2[col]) || 0;
          const max = Math.max(val1, val2);
          const min = Math.min(val1, val2);
          const gap = max > 0 ? ((max - min) / max) * 100 : 0;
          return { variable: col, gap: gap, val1: val1, val2: val2 };
        });
        const maxInsumoGap = insumoGaps.reduce(
          (max, current) => (current.gap > max.gap ? current : max),
          { gap: 0 }
        );
        insumoGap = maxInsumoGap.gap;
        maxInsumoVariable = maxInsumoGap.variable;
      }

      // Calcular Gap de Salidas temporal
      let salidaGap = 0;
      let maxSalidaVariable = "";
      if (outputcols.length > 0) {
        const salidaGaps = outputcols.map((col) => {
          const val1 = parseFloat(hospital1[col]) || 0;
          const val2 = parseFloat(hospital2[col]) || 0;
          const max = Math.max(val1, val2);
          const min = Math.min(val1, val2);
          const gap = max > 0 ? ((max - min) / max) * 100 : 0;
          return { variable: col, gap: gap, val1: val1, val2: val2 };
        });
        const maxSalidaGap = salidaGaps.reduce(
          (max, current) => (current.gap > max.gap ? current : max),
          { gap: 0 }
        );
        salidaGap = maxSalidaGap.gap;
        maxSalidaVariable = maxSalidaGap.variable;
      }

      return {
        insumoGap: insumoGap,
        salidaGap: salidaGap,
        eficienciaGap: eficienciaGap,
        maxInsumoVariable: maxInsumoVariable,
        maxSalidaVariable: maxSalidaVariable,
      };
    }

    // Calcular Gap de Eficiencia (diferencia en puntos porcentuales)
    const eficiencia1 = parseFloat(hospital1.eficiencia) || 0;
    const eficiencia2 = parseFloat(hospital2.eficiencia) || 0;
    const eficienciaGap = Math.abs(eficiencia1 - eficiencia2); // Calcular Gap de Insumos (máxima diferencia relativa entre entradas)
    let insumoGap = 0;
    let maxInsumoVariable = "";
    if (inputcols.length > 0) {
      const insumoGaps = inputcols.map((col) => {
        const val1 = parseFloat(hospital1[col]) || 0;
        const val2 = parseFloat(hospital2[col]) || 0;
        const max = Math.max(val1, val2);
        const min = Math.min(val1, val2);
        const gap = max > 0 ? ((max - min) / max) * 100 : 0;
        return { variable: col, gap: gap, val1: val1, val2: val2 };
      });
      // Encontrar la máxima diferencia entre todas las entradas
      const maxInsumoGap = insumoGaps.reduce(
        (max, current) => (current.gap > max.gap ? current : max),
        { gap: 0 }
      );
      insumoGap = maxInsumoGap.gap;
      maxInsumoVariable = maxInsumoGap.variable;
      console.log("Mayor gap en insumos:", maxInsumoGap);
    } // Calcular Gap de Salidas (máxima diferencia relativa entre salidas)
    let salidaGap = 0;
    let maxSalidaVariable = "";
    if (outputcols.length > 0) {
      const salidaGaps = outputcols.map((col) => {
        const val1 = parseFloat(hospital1[col]) || 0;
        const val2 = parseFloat(hospital2[col]) || 0;
        const max = Math.max(val1, val2);
        const min = Math.min(val1, val2);
        const gap = max > 0 ? ((max - min) / max) * 100 : 0;
        return { variable: col, gap: gap, val1: val1, val2: val2 };
      });
      // Encontrar la máxima diferencia entre todas las salidas
      const maxSalidaGap = salidaGaps.reduce(
        (max, current) => (current.gap > max.gap ? current : max),
        { gap: 0 }
      );
      salidaGap = maxSalidaGap.gap;
      maxSalidaVariable = maxSalidaGap.variable;
      console.log("Mayor gap en salidas:", maxSalidaGap);
    }
    return {
      insumoGap: insumoGap,
      salidaGap: salidaGap,
      eficienciaGap: eficienciaGap,
      maxInsumoVariable: maxInsumoVariable,
      maxSalidaVariable: maxSalidaVariable,
    };
  }, [
    compareHospitals,
    hospitalTemporalData.yearA,
    hospitalTemporalData.yearB,
    isTemporalComparison,
    inputcols,
    outputcols,
  ]); // Effect para inicializar datos temporales cuando se carga por primera vez
  useEffect(() => {
    if (isTemporalComparison && hospitalesSeleccionados.length === 1) {
      const baseHospital = hospitalesSeleccionados[0];

      // Solo inicializar si es la primera vez que se entra en modo temporal
      // y no hay datos temporales previos
      if (!hospitalTemporalData.yearA && !hospitalTemporalData.yearB) {
        // Usar el año del hospital base si está disponible, sino usar los valores por defecto
        const yearAToUse = baseHospital.año || hospitalAYear;
        const yearBToUse = baseHospital.año || hospitalBYear;

        actions.setTemporalYearA({
          ...baseHospital,
          año: yearAToUse,
        });

        actions.setTemporalYearB({
          ...baseHospital,
          año: yearBToUse,
        });

        // Solo actualizar los estados locales si es necesario
        if (baseHospital.año && baseHospital.año !== hospitalAYear) {
          setHospitalAYear(baseHospital.año);
        }
        if (baseHospital.año && baseHospital.año !== hospitalBYear) {
          setHospitalBYear(baseHospital.año);
        }
      }
    } else {
      // Si no es comparación temporal, limpiar datos temporales
      actions.clearTemporalData();
    }
  }, [isTemporalComparison, hospitalesSeleccionados, actions]);

  // Función para obtener las props del filtro de búsqueda
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          placeholder={`Buscar ${
            dataIndex === "hospital" ? "hospital" : dataIndex
          }`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Buscar
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Limpiar
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filtrar
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Cerrar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          // Enfocar el input cuando se abra el dropdown
        }, 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: "#ffc069", padding: "0 4px" }}>
          {text}
        </span>
      ) : (
        text
      ),
  });

  // Función para manejar la búsqueda
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  // Función para limpiar el filtro
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  // Datos dummy para la tabla
  const tableData = [
    {
      key: "1",
      hospital: "Hospital General La Paz",
      eficiencia: 92.5,
      percentil: 95,
      lat: -33.4489,
      lng: -70.6693,
      region: "Región Metropolitana",
    },
    {
      key: "2",
      hospital: "Hospital Nacional Dos de Mayo",
      eficiencia: 88.3,
      percentil: 89,
      lat: -33.4372,
      lng: -70.6506,
      region: "Región Metropolitana",
    },
    {
      key: "3",
      hospital: "Hospital Guillermo Almenara",
      eficiencia: 85.7,
      percentil: 82,
      lat: -33.4616,
      lng: -70.6506,
      region: "Región Metropolitana",
    },
    {
      key: "4",
      hospital: "Hospital Rebagliati",
      eficiencia: 91.2,
      percentil: 93,
      lat: -33.4147,
      lng: -70.6112,
      region: "Región Metropolitana",
    },
    {
      key: "5",
      hospital: "Hospital María Auxiliadora",
      eficiencia: 78.9,
      percentil: 68,
      lat: -33.5206,
      lng: -70.6344,
      region: "Región Metropolitana",
    },
    {
      key: "6",
      hospital: "Hospital San Juan de Lurigancho",
      eficiencia: 82.4,
      percentil: 75,
      lat: -33.3823,
      lng: -70.5045,
      region: "Región Metropolitana",
    },
    {
      key: "7",
      hospital: "Hospital Cayetano Heredia",
      eficiencia: 89.6,
      percentil: 88,
      lat: -33.3616,
      lng: -70.5712,
      region: "Región Metropolitana",
    },
    {
      key: "8",
      hospital: "Hospital Sergio Bernales",
      eficiencia: 76.3,
      percentil: 62,
      lat: -33.3823,
      lng: -70.7045,
      region: "Región Metropolitana",
    },
  ];
  // Función para obtener el icono según la eficiencia
  const getMarkerIcon = (eficiencia) => {
    if (eficiencia >= 90) return highEfficiencyIcon;
    if (eficiencia >= 80) return mediumEfficiencyIcon;
    return lowEfficiencyIcon;
  };

  // Función para realizar cálculos
  const fetchData = async () => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const inputCols =
        inputcols.length > 0
          ? inputcols
          : ["bienesyservicios", "remuneraciones", "diascamadisponibles"];
      const outputCols = outputcols.length > 0 ? outputcols : ["consultas"];

      // Actualizar estado global con los parámetros usados en el cálculo
      actions.setInputCols(inputCols);
      actions.setOutputCols(outputCols);
      if (calculationMethod === "SFA") {
        const response = await ApiService.fetchSFAMetrics(
          selectedYear,
          inputCols,
          outputCols
        );

        // Guardar en estado global
        actions.setHospitales(response.results || []);
        actions.setKpis(response.kpis || []);
        console.log("Datos SFA actualizados:", response.results);
      } else if (calculationMethod === "DEA") {
        const response = await ApiService.fetchDEAMetrics(
          selectedYear,
          inputCols,
          outputCols
        );

        // Guardar en estado global
        actions.setHospitales(response.results || []);
        actions.setKpis(response.kpis || []);
        console.log("Datos DEA actualizados:", response.results);
      }
    } catch (err) {
      actions.setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      actions.setLoading(false);
    }
  };

  // Función para obtener datos de un hospital específico para un año
  const fetchTemporalData = async (hospital, year) => {
    actions.setTemporalLoading(true);
    actions.setTemporalError(null);

    try {
      const inputCols =
        inputcols.length > 0
          ? inputcols
          : ["bienesyservicios", "remuneraciones", "diascamadisponibles"];
      const outputCols = outputcols.length > 0 ? outputcols : ["consultas"];

      console.log(
        `Obteniendo datos temporales para ${hospital.hospital} año ${year}`
      );

      if (calculationMethod === "SFA") {
        const response = await ApiService.fetchSFAMetrics(
          year,
          inputCols,
          outputCols
        );

        // Buscar el hospital específico en los resultados
        const hospitalData = response.results?.find(
          (h) =>
            h.hospital_name === hospital.hospital ||
            h.id === hospital.id ||
            h.key === hospital.key
        );

        return hospitalData;
      } else if (calculationMethod === "DEA") {
        const response = await ApiService.fetchDEAMetrics(
          year,
          inputCols,
          outputCols
        );

        // Buscar el hospital específico en los resultados
        const hospitalData = response.results?.find(
          (h) =>
            h.hospital_name === hospital.hospital ||
            h.id === hospital.id ||
            h.key === hospital.key
        );

        return hospitalData;
      }
    } catch (err) {
      actions.setTemporalError(err.message);
      console.error("Error fetching temporal data:", err);
      return null;
    } finally {
      actions.setTemporalLoading(false);
    }
  };

  // Función para manejar cambios de año en comparación temporal
  const handleYearChange = async (year, hospitalIndex) => {
    if (!isTemporalComparison || !hospitalesSeleccionados[0]) return;

    const baseHospital = hospitalesSeleccionados[0];
    console.log(
      `Cambiando año ${
        hospitalIndex === 0 ? "A" : "B"
      } a ${year} para hospital ${baseHospital.hospital}`
    );

    // Actualizar el estado local del año
    if (hospitalIndex === 0) {
      setHospitalAYear(year);
    } else {
      setHospitalBYear(year);
    }

    // Obtener datos del hospital para el nuevo año
    const hospitalData = await fetchTemporalData(baseHospital, year);

    if (hospitalData) {
      // Calcular eficiencia como se hace en EficienciaView
      const eficienciaField = calculationMethod === "SFA" ? "ET SFA" : "ET DEA";
      const eficiencia = hospitalData[eficienciaField] || 0;
      const eficienciaFormatted = (eficiencia * 100).toFixed(1);

      // Crear objeto hospital con datos actualizados
      const updatedHospitalData = {
        ...baseHospital,
        ...hospitalData,
        eficiencia: eficienciaFormatted,
        año: year,
        percentil: hospitalData.percentil || baseHospital.percentil,
        region: hospitalData.region || baseHospital.region,
        lat: hospitalData.latitud || baseHospital.lat,
        lng: hospitalData.longitud || baseHospital.lng,
      };

      // Guardar en el estado global
      if (hospitalIndex === 0) {
        actions.setTemporalYearA(updatedHospitalData);
      } else {
        actions.setTemporalYearB(updatedHospitalData);
      }

      console.log(
        `Datos actualizados para año ${hospitalIndex === 0 ? "A" : "B"}:`,
        updatedHospitalData
      );
    }
  };

  return (
    <Layout style={{ height: "calc(100vh - 64px)" }}>
      <Sider
        width={280}
        style={{ background: colorBgContainer, position: "relative" }}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        trigger={null}
      >
        <div
          style={{
            padding: collapsed ? "8px" : "8px 16px 16px 16px",
            height: "calc(100% - 48px)",
            overflowY: "auto",
          }}
        >
          {collapsed ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                paddingTop: "16px",
              }}
            >
              <Button
                type="text"
                icon={<SettingFilled />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#666",
                }}
                title="Parámetros de Cálculo"
              />
              <Button
                type="text"
                icon={<EditFilled />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#1890ff",
                }}
                title="Entradas"
              />
              <Button
                type="text"
                icon={<EditFilled />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#52c41a",
                }}
                title="Salidas"
              />
            </div>
          ) : (
            <>
              <SectionTooltip
                tooltipData={{
                  title: "Configuración del Análisis",
                  content:
                    "Ajusta los parámetros para personalizar el cálculo de eficiencia hospitalaria según tus necesidades de análisis.",
                }}
              >
                <Title
                  level={4}
                  style={{
                    marginTop: "4px",
                    marginBottom: "20px",
                    color: "#333",
                    textAlign: "center",
                    borderBottom: "1px solid #e8e8e8",
                    paddingBottom: "12px",
                  }}
                >
                  Parámetros de Cálculo
                </Title>
              </SectionTooltip>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <EditFilled
                  style={{
                    fontSize: "16px",
                    color: "#1890ff",
                    marginRight: "8px",
                  }}
                />
                <ParameterTooltip
                  tooltipData={getTooltip(
                    "comparacion",
                    "parametros",
                    "entradas"
                  )}
                >
                  <Title level={5} style={{ margin: 0, color: "#333" }}>
                    Entradas
                  </Title>
                </ParameterTooltip>
              </div>{" "}
              <Select
                mode="multiple"
                placeholder="Seleccionar entradas"
                value={inputcols}
                onChange={actions.setInputCols}
                style={{ width: "100%", marginBottom: "16px" }}
                options={[
                  { value: "bienesyservicios", label: "Bienes y Servicios" },
                  { value: "remuneraciones", label: "Remuneraciones" },
                  {
                    value: "diascamadisponibles",
                    label: "Días de cama disponibles",
                  },
                ]}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <EditFilled
                  style={{
                    fontSize: "16px",
                    color: "#52c41a",
                    marginRight: "8px",
                  }}
                />
                <ParameterTooltip
                  tooltipData={getTooltip(
                    "comparacion",
                    "parametros",
                    "salidas"
                  )}
                >
                  <Title level={5} style={{ margin: 0, color: "#333" }}>
                    Salidas
                  </Title>
                </ParameterTooltip>
              </div>{" "}
              <Select
                mode="multiple"
                placeholder="Seleccionar salidas"
                value={outputcols}
                onChange={actions.setOutputCols}
                style={{ width: "100%", marginBottom: "24px" }}
                options={[
                  { value: "consultas", label: "Consultas" },
                  { value: "grdxegresos", label: "Egresos x GRD" },
                  { value: "consultasurgencias", label: "Consultas urgencias" },
                  { value: "examenes", label: "Exámenes" },
                  { value: "quirofanos", label: "Quirófanos" },
                ]}
              />{" "}
              <SectionTooltip
                tooltipData={getTooltip("comparacion", "acciones", "calcular")}
              >
                <Button
                  type="primary"
                  size="large"
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                  }}
                  loading={loading}
                  onClick={() => {
                    const logData = {
                      inputcols,
                      outputcols,
                      selectedYear,
                      calculationMethod,
                    };
                    console.log("Calculando con:", logData);
                    console.log(
                      "Hospitales seleccionados antes del cálculo:",
                      hospitalesSeleccionados
                    );
                    console.log(
                      "Estructura de hospitales seleccionados:",
                      hospitalesSeleccionados.map((h) => ({
                        hospital: h.hospital,
                        id: h.id,
                        key: h.key,
                        nombre: h.nombre,
                        name: h.name,
                      }))
                    );
                    fetchData(); // Llamar a la función de la API
                  }}
                >
                  Calcular
                </Button>
              </SectionTooltip>
            </>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTop: "1px solid #f0f0f0",
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: "100%",
              height: "48px",
              borderRadius: 0,
            }}
          />
        </div>
      </Sider>
      <Layout
        style={{
          padding: "0 24px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {" "}
        <Content
          style={{
            padding: 24,
            margin: "16px 0 0 0",
            flex: 1,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
            height: "calc(100vh - 128px)",
          }}
        >
          {/* Indicador de Estado Global */}
          <div style={{ width: "100%", maxWidth: "1200px" }}>
            <StateIndicator />
          </div>

          {/* Header con título y selector de metodología */}
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
              marginTop: "8px",
            }}
          >
            <Title
              level={2}
              style={{
                margin: 0,
              }}
            >
              Comparación hospitalaria
            </Title>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <ParameterTooltip
                tooltipData={getTooltip(
                  "comparacion",
                  "parametros",
                  "metodologia"
                )}
              >
                <Radio.Group
                  value={calculationMethod}
                  onChange={(e) => actions.setMetodologia(e.target.value)}
                  size="middle"
                >
                  <Radio.Button value="SFA">SFA</Radio.Button>
                  <Radio.Button value="DEA">DEA</Radio.Button>
                  <Radio.Button value="DEA-M">DEA-M</Radio.Button>
                </Radio.Group>
              </ParameterTooltip>
            </div>
          </div>

          {/* Manejo de errores */}
          {error && (
            <div
              style={{
                width: "100%",
                maxWidth: "1200px",
                marginBottom: "16px",
              }}
            >
              <Alert
                message="Error en el cálculo"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => actions.setError(null)}
              />
            </div>
          )}

          {/* Mostrar mensaje si no hay hospitales seleccionados */}
          {compareHospitals.length === 0 ? (
            <div
              style={{
                width: "100%",
                maxWidth: "1200px",
                textAlign: "center",
                padding: "60px 0",
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <p>No hay hospitales seleccionados para comparar</p>
                    <p style={{ color: "#666", fontSize: "14px" }}>
                      Selecciona hospitales desde la vista de Eficiencia para
                      poder compararlos aquí
                    </p>
                  </div>
                }
              />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div style={{ width: "100%", maxWidth: "1200px" }}>
                <Row
                  gutter={[16, 16]}
                  style={{ marginBottom: "8px", justifyContent: "center" }}
                >
                  {" "}
                  <Col xs={24} sm={8} md={8}>
                    <Card
                      style={{
                        textAlign: "center",
                        height: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        border: "1px solid #e8f4f8",
                        background:
                          "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {" "}
                      <KpiTooltip
                        tooltipData={getTooltip(
                          "comparacion",
                          "kpis",
                          "gapInsumos"
                        )}
                      >
                        <Statistic
                          title="Gap Insumos"
                          value={comparisonKPIs.insumoGap}
                          precision={1}
                          suffix="%"
                          valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                          prefix={<EditFilled />}
                        />
                      </KpiTooltip>
                    </Card>
                  </Col>{" "}
                  <Col xs={24} sm={8} md={8}>
                    <Card
                      style={{
                        textAlign: "center",
                        height: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        border: "1px solid #f0f9e8",
                        background:
                          "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {" "}
                      <KpiTooltip
                        tooltipData={getTooltip(
                          "comparacion",
                          "kpis",
                          "gapProductos"
                        )}
                      >
                        <Statistic
                          title="Gap Productos"
                          value={comparisonKPIs.salidaGap}
                          precision={1}
                          suffix="%"
                          valueStyle={{ color: "#52c41a", fontSize: "18px" }}
                          prefix={<TrophyOutlined />}
                        />
                      </KpiTooltip>
                    </Card>
                  </Col>{" "}
                  <Col xs={24} sm={8} md={8}>
                    <Card
                      style={{
                        textAlign: "center",
                        height: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        border: "1px solid #fff1f0",
                        background:
                          "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {" "}
                      <KpiTooltip
                        tooltipData={getTooltip(
                          "comparacion",
                          "kpis",
                          "gapEficiencia"
                        )}
                      >
                        <Statistic
                          title="Gap Eficiencia"
                          value={comparisonKPIs.eficienciaGap}
                          precision={1}
                          suffix="%"
                          valueStyle={{ color: "#fa8c16", fontSize: "18px" }}
                          prefix={<LineChartOutlined />}
                        />
                      </KpiTooltip>
                    </Card>
                  </Col>{" "}
                </Row>{" "}
              </div>{" "}
              {/* Manejo de errores para datos temporales */}
              {hospitalTemporalData.error && (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "1200px",
                    marginTop: "16px",
                  }}
                >
                  <Alert
                    message="Error al cargar datos temporales"
                    description={hospitalTemporalData.error}
                    type="warning"
                    showIcon
                    closable
                    onClose={() => actions.setTemporalError(null)}
                  />
                </div>
              )}
              {/* Sección de Mapa y Tabla */}
              <div
                style={{ width: "100%", maxWidth: "1200px", marginTop: "32px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                    height: "60px", // Altura fija exacta
                  }}
                >
                  <Title
                    level={4}
                    style={{ marginTop: 10, margin: 0, textAlign: "left" }}
                  >
                    Distribución y comparación de hospitales
                  </Title>
                </div>
                <Row gutter={[24, 0]} style={{ alignItems: "stretch" }}>
                  {/* Mapa de Chile */}
                  <Col xs={24} lg={10} style={{ display: "flex" }}>
                    {" "}
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                        height: "100%",
                        minHeight: "500px",
                        maxHeight: "500px",
                        flex: 1,
                      }}
                    >
                      <MapContainer
                        center={[-33.4489, -70.6693]}
                        zoom={10}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={true}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />{" "}
                        <MapLegend />
                        {compareHospitals.map((hospital) => (
                          <Marker
                            key={hospital.key}
                            position={[hospital.lat, hospital.lng]}
                            icon={getMarkerIcon(hospital.eficiencia)}
                          >
                            <Popup>
                              <div
                                style={{
                                  textAlign: "center",
                                  minWidth: "150px",
                                }}
                              >
                                <strong>{hospital.hospital}</strong>
                                <br />
                                <span style={{ color: "#666" }}>
                                  {hospital.region}
                                </span>
                                <br />
                                <span
                                  style={{
                                    color: "#1890ff",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Eficiencia: {hospital.eficiencia}%
                                </span>
                                <br />
                                <span style={{ color: "#666" }}>
                                  Percentil: {hospital.percentil}°
                                </span>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>{" "}
                    </div>{" "}
                  </Col>{" "}
                  {/* Cards de Hospitales para Comparación */}
                  <Col xs={24} lg={14} style={{ display: "flex" }}>
                    <Spin
                      spinning={hospitalTemporalData.loading}
                      tip="Cargando datos temporales..."
                    >
                      <Row gutter={[24, 0]} style={{ flex: 1 }}>
                        {compareHospitals.map((hospital, index) => (
                          <Col
                            xs={24}
                            md={12}
                            key={`${hospital.key}-${index}`}
                            style={{ display: "flex" }}
                          >
                            <Card
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                border: "2px solid #f0f0f0",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                              bodyStyle={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                padding: "16px",
                              }}
                            >
                              {" "}
                              {/* Header del Hospital */}
                              <div
                                style={{
                                  textAlign: "center",
                                  marginBottom: "12px",
                                  paddingBottom: "10px",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                <Title
                                  level={5}
                                  style={{
                                    margin: 0,
                                    marginBottom: "4px",
                                    color: "#1890ff",
                                    fontSize: "14px",
                                  }}
                                >
                                  {isTemporalComparison
                                    ? index === 0
                                      ? `${hospital.hospital} - Año A`
                                      : `${hospital.hospital} - Año B`
                                    : index === 0
                                    ? "Hospital A"
                                    : "Hospital B"}
                                </Title>
                                <Title
                                  level={4}
                                  style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    lineHeight: "1.2",
                                    marginBottom: isTemporalComparison
                                      ? "8px"
                                      : "0px",
                                  }}
                                >
                                  {!isTemporalComparison
                                    ? hospital.hospital
                                    : ""}
                                </Title>{" "}
                                {/* Selector de año solo para comparación temporal */}
                                {isTemporalComparison && (
                                  <Select
                                    value={
                                      index === 0
                                        ? hospitalAYear
                                        : hospitalBYear
                                    }
                                    onChange={(value) => {
                                      handleYearChange(value, index);
                                    }}
                                    size="small"
                                    style={{ width: "100px" }}
                                    options={[
                                      { value: 2023, label: "2023" },
                                      { value: 2022, label: "2022" },
                                      { value: 2021, label: "2021" },
                                      { value: 2020, label: "2020" },
                                      { value: 2019, label: "2019" },
                                      { value: 2018, label: "2018" },
                                      { value: 2017, label: "2017" },
                                      { value: 2016, label: "2016" },
                                      { value: 2015, label: "2015" },
                                      { value: 2014, label: "2014" },
                                    ]}
                                  />
                                )}
                              </div>{" "}
                              {/* Métricas del Hospital */}
                              <div style={{ flex: 1 }}>
                                <Row gutter={[0, 10]}>
                                  {/* Eficiencia Técnica */}
                                  <Col span={24}>
                                    <KpiTooltip
                                      tooltipData={getTooltip(
                                        "comparacion",
                                        "metricas",
                                        "eficienciaTecnica"
                                      )}
                                    >
                                      <div
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                                          padding: "12px",
                                          borderRadius: "6px",
                                          textAlign: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "20px",
                                            fontWeight: "bold",
                                            color: "#1890ff",
                                          }}
                                        >
                                          {hospital.eficiencia}%
                                        </div>
                                        <div
                                          style={{
                                            fontSize: "11px",
                                            color: "#666",
                                            marginTop: "2px",
                                          }}
                                        >
                                          Eficiencia Técnica
                                        </div>
                                      </div>
                                    </KpiTooltip>
                                  </Col>

                                  {/* Percentil */}
                                  <Col span={24}>
                                    <KpiTooltip
                                      tooltipData={getTooltip(
                                        "comparacion",
                                        "metricas",
                                        "percentilNacional"
                                      )}
                                    >
                                      <div
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
                                          padding: "12px",
                                          borderRadius: "6px",
                                          textAlign: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                            color: "#52c41a",
                                          }}
                                        >
                                          {hospital.percentil}°
                                        </div>
                                        <div
                                          style={{
                                            fontSize: "11px",
                                            color: "#666",
                                            marginTop: "2px",
                                          }}
                                        >
                                          Percentil Nacional
                                        </div>
                                      </div>
                                    </KpiTooltip>
                                  </Col>

                                  {/* Información General */}
                                  <Col span={24}>
                                    <div
                                      style={{
                                        background: "#f8f9fa",
                                        padding: "12px",
                                        borderRadius: "6px",
                                        border: "1px solid #e9ecef",
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: "11px",
                                          color: "#666",
                                          marginBottom: "8px",
                                          fontWeight: "600",
                                        }}
                                      >
                                        Información General
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "4px",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: "10px",
                                              color: "#666",
                                            }}
                                          >
                                            Región:
                                          </span>
                                          <span
                                            style={{
                                              fontSize: "10px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {hospital.region}
                                          </span>
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: "10px",
                                              color: "#666",
                                            }}
                                          >
                                            Año:
                                          </span>
                                          <span
                                            style={{
                                              fontSize: "10px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {isTemporalComparison
                                              ? hospital.año ||
                                                (index === 0
                                                  ? hospitalAYear
                                                  : hospitalBYear)
                                              : hospital.año || selectedYear}
                                          </span>
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: "10px",
                                              color: "#666",
                                            }}
                                          >
                                            Complejidad:
                                          </span>
                                          <span
                                            style={{
                                              fontSize: "10px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {hospital.complejidad || "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </Col>

                                  {/* Inputs (Entradas) */}
                                  <Col span={24}>
                                    <div
                                      style={{
                                        background:
                                          "linear-gradient(135deg, #fff7e6 0%, #fff1dc 100%)",
                                        padding: "12px",
                                        borderRadius: "6px",
                                        border: "1px solid #ffd591",
                                      }}
                                    >
                                      <ParameterTooltip
                                        tooltipData={getTooltip(
                                          "comparacion",
                                          "parametros",
                                          "entradas"
                                        )}
                                      >
                                        <div
                                          style={{
                                            fontSize: "11px",
                                            color: "#d48806",
                                            marginBottom: "8px",
                                            fontWeight: "600",
                                          }}
                                        >
                                          📥 Entradas (Inputs)
                                        </div>
                                      </ParameterTooltip>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "3px",
                                        }}
                                      >
                                        {hospital.bienesyservicios && (
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                color: "#666",
                                              }}
                                            >
                                              Bienes y Servicios:
                                            </span>
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                fontWeight: "500",
                                              }}
                                            >
                                              $
                                              {hospital.bienesyservicios?.toLocaleString() ||
                                                "N/A"}
                                            </span>
                                          </div>
                                        )}
                                        {hospital.remuneraciones && (
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                color: "#666",
                                              }}
                                            >
                                              Remuneraciones:
                                            </span>
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                fontWeight: "500",
                                              }}
                                            >
                                              $
                                              {hospital.remuneraciones?.toLocaleString() ||
                                                "N/A"}
                                            </span>
                                          </div>
                                        )}
                                        {hospital.diascamadisponibles && (
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                color: "#666",
                                              }}
                                            >
                                              Días Cama Disp.:
                                            </span>
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                fontWeight: "500",
                                              }}
                                            >
                                              {hospital.diascamadisponibles?.toLocaleString() ||
                                                "N/A"}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Col>

                                  {/* Outputs (Salidas) */}
                                  <Col span={24}>
                                    <div
                                      style={{
                                        background:
                                          "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
                                        padding: "12px",
                                        borderRadius: "6px",
                                        border: "1px solid #b7eb8f",
                                      }}
                                    >
                                      <ParameterTooltip
                                        tooltipData={getTooltip(
                                          "comparacion",
                                          "parametros",
                                          "salidas"
                                        )}
                                      >
                                        <div
                                          style={{
                                            fontSize: "11px",
                                            color: "#389e0d",
                                            marginBottom: "8px",
                                            fontWeight: "600",
                                          }}
                                        >
                                          📤 Salidas (Outputs)
                                        </div>
                                      </ParameterTooltip>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "3px",
                                        }}
                                      >
                                        {hospital.consultas && (
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                color: "#666",
                                              }}
                                            >
                                              Consultas:
                                            </span>
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                fontWeight: "500",
                                              }}
                                            >
                                              {hospital.consultas?.toLocaleString() ||
                                                "N/A"}
                                            </span>
                                          </div>
                                        )}
                                        {hospital.grdxegresos && (
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                color: "#666",
                                              }}
                                            >
                                              GRD x Egreso:
                                            </span>
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                fontWeight: "500",
                                              }}
                                            >
                                              {hospital.grdxegresos?.toFixed(
                                                1
                                              ) || "N/A"}
                                            </span>
                                          </div>
                                        )}
                                        {hospital.consultasurgencias && (
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                color: "#666",
                                              }}
                                            >
                                              Consultas Urgencias:
                                            </span>
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                fontWeight: "500",
                                              }}
                                            >
                                              {hospital.consultasurgencias?.toLocaleString() ||
                                                "N/A"}
                                            </span>
                                          </div>
                                        )}
                                        {hospital.examenes && (
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                color: "#666",
                                              }}
                                            >
                                              Exámenes:
                                            </span>
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                fontWeight: "500",
                                              }}
                                            >
                                              {hospital.examenes?.toLocaleString() ||
                                                "N/A"}
                                            </span>
                                          </div>
                                        )}
                                        {hospital.quirofanos && (
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                color: "#666",
                                              }}
                                            >
                                              Quirófanos:
                                            </span>
                                            <span
                                              style={{
                                                fontSize: "9px",
                                                fontWeight: "500",
                                              }}
                                            >
                                              {hospital.quirofanos?.toFixed(
                                                1
                                              ) || "N/A"}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Col>

                                  {/* Clasificación por Eficiencia */}
                                  <Col span={24}>
                                    <div
                                      style={{
                                        background: "#f8f9fa",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #e9ecef",
                                      }}
                                    >
                                      <KpiTooltip
                                        tooltipData={(() => {
                                          const eficiencia =
                                            hospital.eficiencia;
                                          if (eficiencia >= 90) {
                                            return getTooltip(
                                              "comparacion",
                                              "clasificacion",
                                              "altaEficiencia"
                                            );
                                          } else if (eficiencia >= 80) {
                                            return getTooltip(
                                              "comparacion",
                                              "clasificacion",
                                              "eficienciaMedia"
                                            );
                                          } else {
                                            return getTooltip(
                                              "comparacion",
                                              "clasificacion",
                                              "eficienciaBaja"
                                            );
                                          }
                                        })()}
                                      >
                                        <div
                                          style={{
                                            fontSize: "11px",
                                            color: "#666",
                                            marginBottom: "6px",
                                          }}
                                        >
                                          Clasificación por Eficiencia:
                                        </div>
                                      </KpiTooltip>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: "10px",
                                            height: "10px",
                                            borderRadius: "50%",
                                            backgroundColor:
                                              hospital.eficiencia >= 90
                                                ? "#52c41a"
                                                : hospital.eficiencia >= 80
                                                ? "#1890ff"
                                                : "#fa8c16",
                                            marginRight: "6px",
                                          }}
                                        ></div>
                                        <span
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            color:
                                              hospital.eficiencia >= 90
                                                ? "#52c41a"
                                                : hospital.eficiencia >= 80
                                                ? "#1890ff"
                                                : "#fa8c16",
                                          }}
                                        >
                                          {hospital.eficiencia >= 90
                                            ? "Alta Eficiencia"
                                            : hospital.eficiencia >= 80
                                            ? "Eficiencia Media"
                                            : "Eficiencia Baja"}
                                        </span>
                                      </div>
                                    </div>
                                  </Col>
                                </Row>
                              </div>{" "}
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Spin>
                  </Col>
                </Row>
              </div>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ComparacionView;
