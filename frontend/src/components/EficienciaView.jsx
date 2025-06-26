import React, { useState, useEffect } from "react";
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
  CalendarOutlined,
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
  Spin,
  Alert,
} from "antd";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ApiService from "../services/api";
import { useGlobalState } from "../contexts/GlobalStateContext";
import StateIndicator from "./StateIndicator";

// Componente de leyenda personalizado para Leaflet
const MapLegend = ({ method = "SFA" }) => {
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

      let legendContent = `
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 13px; color: #333;">
          📍 Leyenda
        </div>
      `;

      if (method === "DEA-M") {
        legendContent += `
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
            <span style="color: #666; font-size: 11px;">Mejora significativa (>1.1)</span>
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
            <span style="color: #666; font-size: 11px;">Estable (0.9-1.1)</span>
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
            <span style="color: #666; font-size: 11px;">Deterioro (&lt;0.9)</span>
          </div>
        `;
      } else {
        legendContent += `
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
      }

      div.innerHTML = legendContent;
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map, method]);

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

const EficienciaView = ({ onNavigate }) => {
  // Contexto global
  const { state, actions } = useGlobalState();

  // Usar estado global para algunos valores (mover antes de los useEffects)
  const entradas = state.inputcols;
  const salidas = state.outputcols;
  const selectedYear = state.año;
  const calculationMethod = state.metodologia;
  const loading = state.loading;
  const error = state.error;

  // Estados locales (mantener algunos para transición gradual)
  const [collapsed, setCollapsed] = useState(false);
  // selectedRows se sincroniza con el estado global
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [anoInicial, setAnoInicial] = useState(2014);
  const [anoFinal, setAnoFinal] = useState(2018);
  const [variableTop, setVariableTop] = useState("");

  // Estados para la API (gradualmente migrar al contexto global)
  const [sfaData, setSfaData] = useState(null);
  const [deaData, setDeaData] = useState(null);
  const [malmquistData, setMalmquistData] = useState(null);

  // Sincronizar selectedRows con hospitalesSeleccionados del estado global
  useEffect(() => {
    const selectedKeys = state.hospitalesSeleccionados.map(
      (h) => h.key || h.id
    );
    setSelectedRows(selectedKeys);
  }, [state.hospitalesSeleccionados]);

  // Effect para limpiar variableTop cuando cambian las entradas
  useEffect(() => {
    if (variableTop && !entradas.includes(variableTop)) {
      setVariableTop("");
    }
  }, [entradas, variableTop]);

  // Configuración de KPIs por método de cálculo
  const kpiConfigs = {
    SFA: [
      {
        title: "ET Promedio",
        value: 0.742,
        precision: 3,
        color: "#1890ff",
        icon: <LineChartOutlined />,
        gradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        border: "#e8f4f8",
      },
      {
        title: "Hospitales críticos",
        value: 12,
        precision: 0,
        color: "#52c41a",
        icon: <TrophyOutlined />,
        gradient: "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
        border: "#f0f9e8",
      },
      {
        title: "Variable clave",
        value: 3,
        precision: 0,
        color: "#fa8c16",
        icon: <TeamOutlined />,
        gradient: "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
        border: "#fff1f0",
      },
      {
        title: "Varianza",
        value: 0.156,
        precision: 3,
        color: "#722ed1",
        icon: <ClockCircleOutlined />,
        gradient: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
        border: "#f0e6ff",
      },
    ],
    DEA: [
      {
        title: "ET Promedio",
        value: 0.85,
        precision: 3,
        color: "#1890ff",
        icon: <LineChartOutlined />,
        gradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        border: "#e8f4f8",
      },
      {
        title: "Hospitales críticos",
        value: 6,
        precision: 0,
        color: "#52c41a",
        icon: <TrophyOutlined />,
        gradient: "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
        border: "#f0f9e8",
      },
      {
        title: "Slack más alto promedio",
        value: 15.4,
        precision: 1,
        color: "#fa8c16",
        icon: <TeamOutlined />,
        gradient: "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
        border: "#fff1f0",
      },
      {
        title: "Total Hospitales",
        value: 0,
        precision: 0,
        color: "#722ed1",
        icon: <ClockCircleOutlined />,
        gradient: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
        border: "#f0e6ff",
      },
    ],
    "DEA-M": [
      {
        title: "ΔProd Promedio",
        value: "--",
        precision: 1,
        color: "#1890ff",
        icon: <LineChartOutlined />,
        gradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        border: "#e8f4f8",
        suffix: "%",
      },
      {
        title: "ΔEficiencia",
        value: "--",
        precision: 3,
        color: "#52c41a",
        icon: <TrophyOutlined />,
        gradient: "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
        border: "#f0f9e8",
      },
      {
        title: "ΔTecnología",
        value: "--",
        precision: 3,
        color: "#fa8c16",
        icon: <TeamOutlined />,
        gradient: "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
        border: "#fff1f0",
      },
      {
        title: "Hosp. Mejorados",
        value: "--",
        precision: 1,
        color: "#722ed1",
        icon: <ClockCircleOutlined />,
        gradient: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
        border: "#f0e6ff",
        suffix: "%",
      },
    ],
  };

  // Función para generar KPIs dinámicamente basándose en los datos de respuesta
  const generateKpisFromData = (responseData, method) => {
    if (!responseData || !responseData.metrics) {
      return kpiConfigs[method] || [];
    }

    const metrics = responseData.metrics;

    if (method === "SFA") {
      return [
        {
          title: "ET Promedio",
          value: metrics.et_promedio || 0,
          precision: 2,
          color: "#1890ff",
          icon: <LineChartOutlined />,
          gradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          border: "#e8f4f8",
        },
        {
          title: "Hospitales críticos",
          value: metrics.pct_criticos || 0,
          precision: 1,
          suffix: "%",
          color: "#52c41a",
          icon: <TrophyOutlined />,
          gradient: "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
          border: "#f0f9e8",
        },
        {
          title: "Variable clave",
          value: metrics.variable_clave || "No determinada",
          precision: 0,
          color: "#fa8c16",
          icon: <TeamOutlined />,
          gradient: "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
          border: "#fff1f0",
        },
        {
          title: "Varianza",
          value: metrics.varianza || 0,
          precision: 2,
          color: "#722ed1",
          icon: <ClockCircleOutlined />,
          gradient: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
          border: "#f0e6ff",
        },
      ];
    } else if (method === "DEA-M") {
      return [
        {
          title: "ΔProd Promedio",
          value: metrics.delta_prod_promedio || 0,
          precision: 1,
          color: "#1890ff",
          icon: <LineChartOutlined />,
          gradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          border: "#e8f4f8",
          suffix: "%",
        },
        {
          title: "ΔEficiencia",
          value: metrics.delta_eficiencia_promedio || 0,
          precision: 3,
          color: "#52c41a",
          icon: <TrophyOutlined />,
          gradient: "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
          border: "#f0f9e8",
        },
        {
          title: "ΔTecnología",
          value: metrics.delta_tecnologia_promedio || 0,
          precision: 3,
          color: "#fa8c16",
          icon: <TeamOutlined />,
          gradient: "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
          border: "#fff1f0",
        },
        {
          title: "Hosp. Mejorados",
          value: metrics.pct_hosp_mejorados || 0,
          precision: 1,
          color: "#722ed1",
          icon: <ClockCircleOutlined />,
          gradient: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
          border: "#f0e6ff",
          suffix: "%",
        },
      ];
    } else {
      return [
        {
          title: "ET Promedio",
          value: metrics.et_promedio || 0,
          precision: 2,
          color: "#1890ff",
          icon: <LineChartOutlined />,
          gradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          border: "#e8f4f8",
        },
        {
          title: "Hospitales críticos",
          value: metrics.pct_criticos || 0,
          precision: 1,
          suffix: "%",
          color: "#52c41a",
          icon: <TrophyOutlined />,
          gradient: "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
          border: "#f0f9e8",
        },
        {
          title: "Slack más alto promedio",
          value: metrics.top_slack_promedio || "No determinado",
          precision: 0,
          color: "#fa8c16",
          icon: <TeamOutlined />,
          gradient: "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
          border: "#fff1f0",
        },
        {
          title: "Total hospitales",
          value: responseData.results ? responseData.results.length : 0,
          precision: 0,
          color: "#722ed1",
          icon: <ClockCircleOutlined />,
          gradient: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
          border: "#f0e6ff",
        },
      ];
    }
  }; // Función para generar KPIs dinámicamente basándose en los datos de la API
  const getCurrentKpis = () => {
    // Verificar si tenemos datos válidos para la metodología actual
    let currentData = null;
    
    if (calculationMethod === "SFA" && sfaData && sfaData.metrics) {
      currentData = sfaData;
    } else if (calculationMethod === "DEA" && deaData && deaData.metrics) {
      currentData = deaData;
    } else if (calculationMethod === "DEA-M" && malmquistData && malmquistData.metrics) {
      currentData = malmquistData;
    }
    
    // Si tenemos datos válidos para la metodología actual, generar KPIs dinámicos
    if (currentData && currentData.metrics) {
      return generateKpisFromData(currentData, calculationMethod);
    }
    
    // Si no hay datos calculados para la metodología actual, mostrar placeholders
    const placeholderKpis = kpiConfigs[calculationMethod] || [];
    return placeholderKpis.map((kpi) => ({
      ...kpi,
      value: "--",
    }));
  };

  const currentKpis = getCurrentKpis();

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
  }); // Funciones para manejar la API
  const fetchData = async () => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const inputCols =
        entradas.length > 0
          ? entradas
          : ["bienesyservicios", "remuneraciones", "diascamadisponibles"];
      const outputCols = salidas.length > 0 ? salidas : ["consultas"];

      // Actualizar estado global con los parámetros usados en el cálculo
      actions.setInputCols(inputCols);
      actions.setOutputCols(outputCols);

      if (calculationMethod === "SFA") {
        const response = await ApiService.fetchSFAMetrics(
          selectedYear,
          inputCols,
          outputCols
        );
        setSfaData(response);

        // Generar KPIs dinámicamente basándose en los datos recibidos
        const dynamicKpis = generateKpisFromData(response, "SFA");

        // Guardar en estado global
        actions.setHospitales(response.results || []);
        actions.setKpis(
          response.kpis && response.kpis.length > 0
            ? response.kpis
            : dynamicKpis
        );
      } else if (calculationMethod === "DEA") {
        const response = await ApiService.fetchDEAMetrics(
          selectedYear,
          inputCols,
          outputCols
        );
        setDeaData(response);

        // Generar KPIs dinámicamente basándose en los datos recibidos
        const dynamicKpis = generateKpisFromData(response, "DEA");

        // Guardar en estado global
        actions.setHospitales(response.results || []);
        actions.setKpis(
          response.kpis && response.kpis.length > 0
            ? response.kpis
            : dynamicKpis
        );
      } else if (calculationMethod === "DEA-M") {
        const response = await ApiService.fetchMalmquistMetrics(
          anoInicial,
          anoFinal,
          inputCols,
          outputCols,
          variableTop
        );
        setMalmquistData(response);

        // Generar KPIs dinámicamente basándose en los datos recibidos
        const dynamicKpis = generateKpisFromData(response, "DEA-M");

        // Guardar en estado global
        actions.setHospitales(response.results || []);
        actions.setKpis(
          response.kpis && response.kpis.length > 0
            ? response.kpis
            : dynamicKpis
        );
      }
    } catch (err) {
      actions.setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      actions.setLoading(false);
    }
  };
  // Effect para sincronizar KPIs con el estado global cuando cambian los datos locales
  useEffect(() => {
    let currentData = null;

    if (calculationMethod === "SFA") {
      currentData = sfaData;
    } else if (calculationMethod === "DEA") {
      currentData = deaData;
    } else if (calculationMethod === "DEA-M") {
      currentData = malmquistData;
    }

    if (
      currentData &&
      currentData.metrics &&
      (!state.kpis || state.kpis.length === 0)
    ) {
      const dynamicKpis = generateKpisFromData(currentData, calculationMethod);
      actions.setKpis(dynamicKpis);
    }
  }, [sfaData, deaData, malmquistData, calculationMethod, state.kpis, actions]);
  // Effect para cargar datos cuando cambian los parámetros (comentado para que solo se ejecute con el botón Calcular)
  // useEffect(() => {
  //   fetchData();
  // }, [selectedYear, calculationMethod]);

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
  } = theme.useToken(); // Función para transformar datos de la API para la tabla
  const getTableData = () => {
    // Usar el estado global en lugar del estado local
    const hospitalesFromState = state.hospitales;

    // Asegurar que siempre sea un array
    if (
      !Array.isArray(hospitalesFromState) ||
      hospitalesFromState.length === 0
    ) {
      return [];
    }

    return hospitalesFromState.map((hospital, index) => {
      let eficienciaField,
        eficiencia,
        additionalData = {};

      if (calculationMethod === "SFA") {
        eficienciaField = "ET SFA";
        eficiencia =
          hospital[eficienciaField] ||
          hospital["et_sfa"] ||
          hospital["eficiencia"] ||
          0;
      } else if (calculationMethod === "DEA") {
        eficienciaField = "ET DEA";
        eficiencia =
          hospital[eficienciaField] ||
          hospital["et_dea"] ||
          hospital["eficiencia"] ||
          0;
      } else if (calculationMethod === "DEA-M") {
        // Para DEA-M, mapear todos los campos directamente
        eficiencia =
          hospital["Malmquist"] ||
          hospital["malmquist"] ||
          hospital["indice_malmquist"] ||
          0;

        additionalData = {
          EFF_t: typeof hospital.EFF_t === "number" ? hospital.EFF_t : 0,
          EFF_t1: typeof hospital.EFF_t1 === "number" ? hospital.EFF_t1 : 0,
          EFFCH: typeof hospital.EFFCH === "number" ? hospital.EFFCH : 0,
          TECH: typeof hospital.TECH === "number" ? hospital.TECH : 0,
          Malmquist:
            typeof hospital.Malmquist === "number" ? hospital.Malmquist : 0,
          pctDeltaProd:
            typeof hospital["%ΔProd"] === "number" ? hospital["%ΔProd"] : 0,
        };
      }

      // Probar diferentes nombres de campos para el nombre del hospital
      const hospitalName =
        hospital.hospital_name ||
        hospital.nombre ||
        hospital.hospital ||
        `Hospital ${hospital.hospital_id || index + 1}`;

      const result = {
        key: hospital.hospital_id || hospital.id || index.toString(),
        hospital: hospitalName,
        eficiencia:
          calculationMethod === "DEA-M"
            ? typeof eficiencia === "number" && !isNaN(eficiencia)
              ? eficiencia.toFixed(3)
              : "0.000" // Mostrar Malmquist como decimal
            : typeof eficiencia === "number" && !isNaN(eficiencia)
            ? (eficiencia * 100).toFixed(1)
            : "0.0", // Convertir a porcentaje con 1 decimal para SFA/DEA
        percentil: hospital.percentil || hospital.percentile || 0,
        // Datos adicionales específicos para DEA-M
        ...additionalData,
        // Datos adicionales que podrían estar en el hospital
        region:
          hospital.region ||
          hospital.region_name ||
          hospital.region_id ||
          "No especificada",
        lat: hospital.latitud || hospital.lat || hospital.latitude || -33.4489,
        lng:
          hospital.longitud || hospital.lng || hospital.longitude || -70.6693,
        // Datos originales del hospital para referencia
        ...hospital,
      };

      return result;
    });
  };

  // Obtener los datos de la tabla
  const tableData = getTableData();

  // Función para agregar hospitales a comparación
  const handleAddToComparison = () => {
    console.log("Agregar hospitales a comparación:", selectedRows);

    // Obtener los datos completos de los hospitales seleccionados
    const selectedHospitals = tableData.filter((hospital) =>
      selectedRows.includes(hospital.key)
    );

    // Limpiar selecciones anteriores y agregar las nuevas
    actions.clearHospitalesSeleccionados();

    // Agregar cada hospital al estado global
    selectedHospitals.forEach((hospital) => {
      const hospitalData = {
        id: hospital.key,
        hospital: hospital.hospital,
        eficiencia: hospital.eficiencia,
        percentil: hospital.percentil,
        region: hospital.region,
        lat: hospital.lat,
        lng: hospital.lng,
        año: selectedYear,
        // Agregar todos los datos adicionales del hospital
        ...hospital,
      };
      actions.addHospitalSeleccionado(hospitalData);
    });

    // Navegar a la vista de comparación
    if (onNavigate) {
      onNavigate("comparar");
    }
  };

  // Función para obtener el icono según la eficiencia o índice Malmquist
  const getMarkerIcon = (value, method = calculationMethod) => {
    if (method === "DEA-M") {
      // Para DEA-M, usar el índice Malmquist (>1 es mejora, <1 es deterioro)
      const malmquistValue = parseFloat(value);
      if (malmquistValue > 1.1) return highEfficiencyIcon; // Mejora significativa
      if (malmquistValue >= 0.9) return mediumEfficiencyIcon; // Estable
      return lowEfficiencyIcon; // Deterioro
    } else {
      // Para SFA y DEA, usar porcentajes de eficiencia
      const eficiencia = parseFloat(value);
      if (eficiencia >= 90) return highEfficiencyIcon;
      if (eficiencia >= 80) return mediumEfficiencyIcon;
      return lowEfficiencyIcon;
    }
  }; // Configuración de selección de filas
  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys, selectedRowsData) => {
      // Limitar a máximo 2 selecciones
      if (selectedRowKeys.length <= 2) {
        setSelectedRows(selectedRowKeys);

        // Sincronizar con el estado global
        const currentHospitals = state.hospitalesSeleccionados;
        const tableDataMap = tableData.reduce((acc, hospital) => {
          acc[hospital.key] = hospital;
          return acc;
        }, {});

        // Determinar qué hospital fue agregado o removido
        const newKeys = selectedRowKeys.filter(
          (key) => !selectedRows.includes(key)
        );
        const removedKeys = selectedRows.filter(
          (key) => !selectedRowKeys.includes(key)
        );

        // Agregar nuevos hospitales
        newKeys.forEach((key) => {
          const hospital = tableDataMap[key];
          if (hospital) {
            const hospitalData = {
              id: hospital.key,
              key: hospital.key,
              hospital: hospital.hospital,
              eficiencia: hospital.eficiencia,
              percentil: hospital.percentil,
              region: hospital.region,
              lat: hospital.lat,
              lng: hospital.lng,
              año: selectedYear,
              ...hospital,
            };
            actions.addHospitalSeleccionado(hospitalData);
          }
        });

        // Remover hospitales deseleccionados
        removedKeys.forEach((key) => {
          actions.removeHospitalSeleccionado(key);
        });

        console.log("Filas seleccionadas:", selectedRowKeys, selectedRowsData);
      }
    },
    getCheckboxProps: (record) => ({
      disabled: selectedRows.length >= 2 && !selectedRows.includes(record.key),
      name: record.hospital,
    }),
  }; // Columnas de la tabla
  const getColumns = () => {
    const baseColumns = [
      {
        title: "Hospital",
        dataIndex: "hospital",
        key: "hospital",
        width: calculationMethod === "DEA-M" ? "40%" : "60%",
        ...getColumnSearchProps("hospital"),
        ellipsis: true,
      },
    ];

    if (calculationMethod === "DEA-M") {
      // Columnas específicas para DEA-M (Malmquist)
      return [
        ...baseColumns,
        {
          title: "EFF_t",
          dataIndex: "EFF_t",
          key: "EFF_t",
          width: "12%",
          render: (value) => {
            return (
              <span>
                {typeof value === "number" ? value.toFixed(3) : "0.000"}
              </span>
            );
          },
          sorter: (a, b) => (a.EFF_t || 0) - (b.EFF_t || 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: "EFF_t1",
          dataIndex: "EFF_t1",
          key: "EFF_t1",
          width: "12%",
          render: (value) => {
            return (
              <span>
                {typeof value === "number" ? value.toFixed(3) : "0.000"}
              </span>
            );
          },
          sorter: (a, b) => (a.EFF_t1 || 0) - (b.EFF_t1 || 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: "EFFCH",
          dataIndex: "EFFCH",
          key: "EFFCH",
          width: "12%",
          render: (value) => {
            const numValue = typeof value === "number" ? value : 0;
            const color =
              numValue > 1 ? "#52c41a" : numValue < 1 ? "#ff4d4f" : "#666";
            return <span style={{ color }}>{numValue.toFixed(3)}</span>;
          },
          sorter: (a, b) => (a.EFFCH || 0) - (b.EFFCH || 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: "TECH",
          dataIndex: "TECH",
          key: "TECH",
          width: "12%",
          render: (value) => {
            const numValue = typeof value === "number" ? value : 0;
            const color =
              numValue > 1 ? "#52c41a" : numValue < 1 ? "#ff4d4f" : "#666";
            return <span style={{ color }}>{numValue.toFixed(3)}</span>;
          },
          sorter: (a, b) => (a.TECH || 0) - (b.TECH || 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: "Malmquist",
          dataIndex: "Malmquist",
          key: "Malmquist",
          width: "12%",
          render: (value) => {
            const numValue = typeof value === "number" ? value : 0;
            const color =
              numValue > 1 ? "#52c41a" : numValue < 1 ? "#ff4d4f" : "#666";
            return (
              <span style={{ color, fontWeight: "bold" }}>
                {numValue.toFixed(3)}
              </span>
            );
          },
          sorter: (a, b) => (a.Malmquist || 0) - (b.Malmquist || 0),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: "%ΔProd",
          dataIndex: "pctDeltaProd",
          key: "pctDeltaProd",
          width: "12%",
          render: (value) => {
            const numValue = typeof value === "number" ? value : 0;
            const color =
              numValue > 0 ? "#52c41a" : numValue < 0 ? "#ff4d4f" : "#666";
            return <span style={{ color }}>{numValue.toFixed(1)}%</span>;
          },
          sorter: (a, b) => (a.pctDeltaProd || 0) - (b.pctDeltaProd || 0),
          sortDirections: ["descend", "ascend"],
        },
      ];
    } else {
      // Columnas para SFA y DEA
      return [
        ...baseColumns,
        {
          title: calculationMethod === "SFA" ? "ET SFA" : "ET DEA",
          dataIndex: "eficiencia",
          key: "eficiencia",
          width: "20%",
          render: (value) => `${value}%`,
          sorter: (a, b) => parseFloat(a.eficiencia) - parseFloat(b.eficiencia),
          sortDirections: ["descend", "ascend"],
        },
        {
          title: "Percentil",
          dataIndex: "percentil",
          key: "percentil",
          width: "20%",
          render: (value) => `${value}°`,
          sorter: (a, b) => a.percentil - b.percentil,
          sortDirections: ["descend", "ascend"],
        },
      ];
    }
  };

  const columns = getColumns();
  return (
    <Layout style={{ height: "calc(100vh - 64px)" }}>
      {/* Mostrar error si existe */}
      {error && (
        <Alert
          message="Error al cargar datos"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ margin: "16px" }}
        />
      )}

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
          {" "}
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
              {calculationMethod === "DEA-M" && (
                <Button
                  type="text"
                  icon={<CalendarOutlined />}
                  style={{
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    color: "#722ed1",
                  }}
                  title="Años"
                />
              )}
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
              />{" "}
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
              {calculationMethod === "DEA-M" && (
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
                    color: "#722ed1",
                  }}
                  title="Variable Top"
                />
              )}
            </div>
          ) : (
            <>
              {" "}
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
              {/* Sección de Años - solo para DEA-M */}
              {calculationMethod === "DEA-M" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <CalendarOutlined
                      style={{
                        fontSize: "16px",
                        color: "#722ed1",
                        marginRight: "8px",
                      }}
                    />
                    <Title level={5} style={{ margin: 0, color: "#333" }}>
                      Años
                    </Title>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      Año Inicial
                    </label>
                    <Select
                      placeholder="Seleccionar año inicial"
                      value={anoInicial}
                      onChange={setAnoInicial}
                      style={{ width: "100%" }}
                      options={[
                        { value: 2014, label: "2014" },
                        { value: 2015, label: "2015" },
                        { value: 2016, label: "2016" },
                        { value: 2017, label: "2017" },
                        { value: 2018, label: "2018" },
                        { value: 2019, label: "2019" },
                        { value: 2020, label: "2020" },
                        { value: 2021, label: "2021" },
                        { value: 2022, label: "2022" },
                        { value: 2023, label: "2023" },
                        { value: 2024, label: "2024" },
                      ]}
                    />
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      Año Final
                    </label>
                    <Select
                      placeholder="Seleccionar año final"
                      value={anoFinal}
                      onChange={setAnoFinal}
                      style={{ width: "100%" }}
                      options={[
                        { value: 2014, label: "2014" },
                        { value: 2015, label: "2015" },
                        { value: 2016, label: "2016" },
                        { value: 2017, label: "2017" },
                        { value: 2018, label: "2018" },
                        { value: 2019, label: "2019" },
                        { value: 2020, label: "2020" },
                        { value: 2021, label: "2021" },
                        { value: 2022, label: "2022" },
                        { value: 2023, label: "2023" },
                        { value: 2024, label: "2024" },
                      ]}
                    />
                  </div>
                </>
              )}
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
                <Title level={5} style={{ margin: 0, color: "#333" }}>
                  Entradas
                </Title>
              </div>{" "}
              <Select
                mode="multiple"
                placeholder="Seleccionar entradas"
                value={entradas}
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
                <Title level={5} style={{ margin: 0, color: "#333" }}>
                  Salidas
                </Title>
              </div>{" "}
              <Select
                mode="multiple"
                placeholder="Seleccionar salidas"
                value={salidas}
                onChange={actions.setOutputCols}
                style={{ width: "100%", marginBottom: "16px" }}
                options={[
                  { value: "consultas", label: "Consultas" },
                  { value: "grdxegresos", label: "Egresos x GRD" },
                  { value: "consultasurgencias", label: "Consultas urgencias" },
                  { value: "examenes", label: "Exámenes" },
                  { value: "quirofanos", label: "Quirófanos" },
                ]}
              />
              {calculationMethod === "DEA-M" && (
                <>
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
                        color: "#722ed1",
                        marginRight: "8px",
                      }}
                    />
                    <Title level={5} style={{ margin: 0, color: "#333" }}>
                      Variable Top
                    </Title>
                  </div>{" "}
                  <Select
                    placeholder="Seleccionar variable de análisis"
                    value={variableTop}
                    onChange={setVariableTop}
                    style={{ width: "100%", marginBottom: "24px" }}
                    allowClear
                    options={entradas.map((entrada) => ({
                      value: entrada,
                      label:
                        entrada === "bienesyservicios"
                          ? "Bienes y Servicios"
                          : entrada === "remuneraciones"
                          ? "Remuneraciones"
                          : entrada === "diascamadisponibles"
                          ? "Días de cama disponibles"
                          : entrada,
                    }))}
                    disabled={entradas.length === 0}
                  />
                </>
              )}
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
                  const logData = { entradas, salidas, variableTop };
                  if (calculationMethod === "DEA-M") {
                    logData.anoInicial = anoInicial;
                    logData.anoFinal = anoFinal;
                  }
                  console.log("Calculando con:", logData);
                  fetchData(); // Llamar a la función de la API
                }}
              >
                Calcular
              </Button>
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
          {" "}
          <Spin spinning={loading} tip="Cargando datos...">
            {/* Indicador de Estado Global */}
            <div style={{ width: "100%", maxWidth: "1200px" }}>
              <StateIndicator />
            </div>
            {/* Header con título y selector de año */}
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
                {calculationMethod === "DEA-M"
                  ? "Análisis Malmquist - Productividad hospitalaria"
                  : "Eficiencia técnica hospitalaria"}
              </Title>{" "}
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                {calculationMethod !== "DEA-M" && (
                  <Select
                    value={selectedYear}
                    onChange={actions.setAño}
                    style={{ width: 120 }}
                    options={[
                      { value: 2014, label: "2014" },
                      { value: 2015, label: "2015" },
                      { value: 2016, label: "2016" },
                      { value: 2017, label: "2017" },
                      { value: 2018, label: "2018" },
                    ]}
                  />
                )}{" "}
                <Radio.Group
                  value={calculationMethod}
                  onChange={(e) => actions.setMetodologia(e.target.value)}
                  size="middle"
                >
                  <Radio.Button value="SFA">SFA</Radio.Button>
                  <Radio.Button value="DEA">DEA</Radio.Button>
                  <Radio.Button value="DEA-M">DEA-M</Radio.Button>
                </Radio.Group>
              </div>
            </div>{" "}
            {/* KPI Cards */}
            <div style={{ width: "100%", maxWidth: "1200px" }}>
              <Row gutter={[16, 16]} style={{ marginBottom: "8px" }}>
                {currentKpis.map((kpi, index) => (
                  <Col xs={24} sm={12} md={6} key={index}>
                    <Card
                      style={{
                        textAlign: "center",
                        height: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        border: `1px solid ${kpi.border}`,
                        background: kpi.gradient,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Statistic
                        title={kpi.title}
                        value={kpi.value}
                        precision={kpi.precision}
                        valueStyle={{ color: kpi.color, fontSize: "18px" }}
                        prefix={kpi.icon}
                        suffix={kpi.suffix || ""}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
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
                  {calculationMethod === "DEA-M"
                    ? "Distribución y Ranking - Índice Malmquist"
                    : "Distribución y Ranking de Hospitales"}
                </Title>{" "}
                {/* Botones de acción - espacio reservado siempre presente */}
                <div
                  style={{
                    width: "460px", // Ancho ampliado para dos botones
                    height: "60px", // Altura fija exacta
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start", // Cambiar a flex-start para alinear por arriba
                    justifyContent: "flex-end",
                    gap: "12px",
                    position: "relative",
                  }}
                >
                  {/* Botón Comparar - solo cuando hay selecciones */}
                  {selectedRows.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        textAlign: "right",
                      }}
                    >
                      <Button
                        type="primary"
                        size="middle"
                        style={{
                          backgroundColor: "#52c41a",
                          borderColor: "#52c41a",
                          marginBottom: "4px",
                          minWidth: "220px",
                        }}
                        onClick={handleAddToComparison}
                      >
                        Comparar{" "}
                        {selectedRows.length === 1 ? "Hospital" : "Hospitales"}{" "}
                        ({selectedRows.length})
                      </Button>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          lineHeight: "1.2",
                        }}
                      >
                        {selectedRows.length === 1
                          ? "Selecciona otro hospital para comparar"
                          : `Comparando ${selectedRows.length} hospitales seleccionados`}
                      </div>
                    </div>
                  )}

                  {/* Botón Analizar Determinantes - siempre presente */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <Button
                      type="primary"
                      size="middle"
                      style={{
                        backgroundColor: "#722ed1",
                        borderColor: "#722ed1",
                        minWidth: "180px",
                        marginBottom: "4px", // Mismo margen que el botón de comparar
                      }}
                      onClick={() => {
                        console.log("Navegando a análisis de determinantes");
                        // Navegar a la vista de determinantes
                        if (onNavigate) {
                          onNavigate("determinantes");
                        }
                      }}
                    >
                      Analizar determinantes
                    </Button>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        lineHeight: "1.2",
                        height: "24px", // Altura fija para mantener alineación
                      }}
                    >
                      {/* Análisis de factores determinantes */}
                    </div>
                  </div>
                </div>
              </div>
              <Row gutter={[24, 0]} style={{ alignItems: "stretch" }}>
                {/* Mapa de Chile */}
                <Col xs={24} lg={10} style={{ display: "flex" }}>
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      height: "100%",
                      minHeight: "500px",
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
                      <MapLegend method={calculationMethod} />
                      {tableData
                        .filter(
                          (hospital) =>
                            selectedRows.length === 0 ||
                            selectedRows.includes(hospital.key)
                        )
                        .map((hospital) => (
                          <Marker
                            key={hospital.key}
                            position={[hospital.lat, hospital.lng]}
                            icon={getMarkerIcon(
                              hospital.eficiencia,
                              calculationMethod
                            )}
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
                                {calculationMethod === "DEA-M" ? (
                                  <>
                                    <span
                                      style={{
                                        color: "#1890ff",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Malmquist: {hospital.eficiencia}
                                    </span>
                                    <br />
                                    <span style={{ color: "#666" }}>
                                      ΔProd: {hospital.pctDeltaProd?.toFixed(1)}
                                      %
                                    </span>
                                  </>
                                ) : (
                                  <>
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
                                  </>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                    </MapContainer>{" "}
                  </div>
                </Col>{" "}
                {/* Tabla de Hospitales */}
                <Col xs={24} lg={14} style={{ display: "flex" }}>
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      height: "100%",
                      minHeight: "500px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {" "}
                    <Table
                      columns={columns}
                      dataSource={tableData}
                      rowSelection={rowSelection}
                      pagination={false}
                      size="middle"
                      scroll={{ x: 600, y: 400 }}
                      style={{
                        flex: 1,
                      }}
                      locale={{
                        emptyText: loading
                          ? "Cargando datos..."
                          : "No hay datos disponibles. Haz clic en 'Calcular' para obtener resultados.",
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default EficienciaView;
