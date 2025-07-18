import React, { useState, useEffect } from "react";
import { useGlobalState } from "../contexts/GlobalStateContext";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingFilled,
  TrophyOutlined,
  LineChartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  EditFilled,
  InfoCircleOutlined,
  BarChartOutlined,
  ApartmentOutlined,
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
  Slider,
  InputNumber,
  Alert,
  Spin,
} from "antd";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LabelList,
} from "recharts";
import { ParameterTooltip, KpiTooltip, ActionTooltip } from "./CustomTooltip";
import { getTooltip } from "../data/tooltips";
import ApiService from "../services/api";

const { Content, Sider } = Layout;
const { Title } = Typography;

// Función utilitaria para formatear números con separador de miles (punto) y decimales con coma
const formatNumber = (value, decimals = 1) => {
  if (typeof value === "number" && !isNaN(value)) {
    return value.toLocaleString("es-CL", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  if (typeof value === "string" && value !== "") {
    const num = Number(value);
    if (!isNaN(num)) {
      return num.toLocaleString("es-CL", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
  }
  return value;
};

const PcaClusterView = ({ onNavigate }) => {
  // Estado global
  const { state, actions } = useGlobalState();

  // Estados locales del sidebar
  const [collapsed, setCollapsed] = useState(false); // Estados específicos de PCA + Clustering
  const [numComponents, setNumComponents] = useState(2);
  const [numClusters, setNumClusters] = useState(null); // null = auto-selección
  // Estados para datos del backend
  const [pcaData, setPcaData] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [componentsMatrix, setComponentsMatrix] = useState({});
  const [clusterSummary, setClusterSummary] = useState({});
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken(); // Opciones de variables disponibles para el análisis (basadas en el backend)
  const availableInputs = [
    { value: "diascamadisponibles", label: "Días cama disponibles" },
    { value: "remuneraciones", label: "Remuneraciones" },
    { value: "bienesyservicios", label: "Bienes y servicios" },
  ];
  const availableOutputs = [
    { value: "consultas", label: "Consultas médicas" },
    { value: "grdxegresos", label: "Egresos x GRD" },
    { value: "consultasurgencias", label: "Consultas de urgencia" },
    { value: "examenes", label: "Exámenes" },
    { value: "quirofanos", label: "Quirófanos" },
  ];
  // Todas las variables disponibles para PCA (inputs + outputs)
  const allAvailableFeatures = [...availableInputs, ...availableOutputs];
  // Calcular el número máximo de componentes disponibles basado en las variables seleccionadas
  const getMaxComponents = () => {
    if (state.inputcols.length === 0 && state.outputcols.length === 0) {
      return 10; // Valor por defecto si no hay variables seleccionadas
    }

    let totalFeatures;
    if (state.metodologia === "SFA") {
      // Para SFA: variables de entrada + 1 (solo la primera variable de salida)
      totalFeatures = state.inputcols.length + 1;
    } else {
      // Para DEA y DEA-M: todas las variables (inputs + outputs) se usan en PCA
      totalFeatures = state.inputcols.length + state.outputcols.length;
    }

    return Math.max(1, totalFeatures); // Mínimo 1 componente
  };

  const maxComponents = getMaxComponents();
  // Función para llamar al endpoint de PCA + Clustering
  const fetchPcaClusterData = async () => {
    actions.setLoading(true);
    actions.setError(null);
    try {
      // Validar que tenemos variables de entrada y salida seleccionadas
      if (state.inputcols.length === 0) {
        throw new Error(
          "Debe seleccionar al menos una variable de entrada para el análisis"
        );
      }

      if (state.outputcols.length === 0) {
        throw new Error(
          "Debe seleccionar al menos una variable de salida para el análisis"
        );
      } // Calcular el número total de características disponibles para PCA
      let totalFeatures;
      if (state.metodologia === "SFA") {
        // Para SFA: variables de entrada + 1 (solo la primera variable de salida)
        totalFeatures = state.inputcols.length + 1;
      } else {
        // Para DEA y DEA-M: todas las variables (inputs + outputs) se usan en PCA
        totalFeatures = state.inputcols.length + state.outputcols.length;
      }

      if (numComponents > totalFeatures) {
        throw new Error(
          `El número de componentes PCA (${numComponents}) no puede ser mayor que el número de características disponibles (${totalFeatures}). ${
            state.metodologia === "SFA"
              ? `Para SFA: ${state.inputcols.length} entrada(s) + 1 salida = ${totalFeatures} características.`
              : `Para ${state.metodologia}: ${state.inputcols.length} entrada(s) + ${state.outputcols.length} salida(s) = ${totalFeatures} características.`
          } Por favor, reduzca el número de componentes o aumente el número de variables.`
        );
      } // Usar ApiService en lugar de fetch hardcodeado
      const data = await ApiService.fetchPcaClustering(
        state.metodologia,
        state.año,
        state.inputcols,
        state.outputcols,
        numComponents,
        numClusters || "auto"
      );

      // Actualizar estados locales con los datos recibidos
      setPcaData(data.results);
      setMetrics(data.metrics);
      setComponentsMatrix(data.components_matrix);
      setClusterSummary(data.cluster_summary);
      actions.setResultadosPcaCluster(data);

      console.log("Datos PCA + Clustering recibidos:", data);
      console.log("Components Matrix:", data.components_matrix);
      console.log("Metrics:", data.metrics);
      console.log("Cluster Summary:", data.cluster_summary);
    } catch (error) {
      console.error("Error fetching PCA cluster data:", error);
      actions.setError(
        `Error al obtener datos de PCA + Clustering: ${error.message}`
      );
    } finally {
      actions.setLoading(false);
    }
  }; // Años disponibles
  const availableYears = [
    2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023,
  ];

  // Colores para clusters
  const clusterColors = [
    "#1890ff",
    "#52c41a",
    "#fa8c16",
    "#eb2f96",
    "#722ed1",
    "#13c2c2",
    "#faad14",
    "#f5222d",
  ]; // Inicializar variables por defecto si están vacías
  useEffect(() => {
    if (state.inputcols.length === 0) {
      actions.setInputCols([
        "diascamadisponibles",
        "remuneraciones",
        "bienesyservicios",
      ]);
    }
    if (state.outputcols.length === 0) {
      actions.setOutputCols(["grdxegresos"]);
    }
  }, [state.inputcols, state.outputcols, actions]);
  // Ajustar automáticamente el número de componentes si excede el máximo permitido
  useEffect(() => {
    // Limitar a máximo 3 componentes para la interfaz
    if (numComponents > 3) {
      setNumComponents(3);
    }
  }, [numComponents]);
  // Restaurar resultados guardados al montar la vista
  useEffect(() => {
    if (
      state.resultadosPcaCluster &&
      Object.keys(state.resultadosPcaCluster).length > 0
    ) {
      const data = state.resultadosPcaCluster;
      setPcaData(data.results);
      setMetrics(data.metrics);
      setComponentsMatrix(data.components_matrix);
      setClusterSummary(data.cluster_summary);
    }
  }, [state.resultadosPcaCluster]);
  // Funciones auxiliares para procesar datos del backend
  const getComponentsTableData = () => {
    if (!componentsMatrix || Object.keys(componentsMatrix).length === 0) {
      return [];
    }

    // El backend devuelve components_matrix en formato orient='index'
    // Es decir: { "PC1": {"feature1": val, "feature2": val}, "PC2": {...}, ... }
    const componentKeys = Object.keys(componentsMatrix);
    if (componentKeys.length === 0) return [];

    // Obtener las features desde el primer componente
    const firstComponent = componentsMatrix[componentKeys[0]];
    const features = firstComponent ? Object.keys(firstComponent) : [];
    if (features.length === 0) return [];

    // Generar datos de la tabla
    const tableData = componentKeys.map((componentKey, i) => {
      const row = {
        key: i + 1,
        component: componentKey, // Usar la clave directamente del backend (PC1, PC2, etc.)
      };

      // Agregar cada feature como columna
      features.forEach((feature) => {
        row[feature] = componentsMatrix[componentKey]?.[feature] || 0;
      });

      return row;
    });

    console.log("Generated components table data:", tableData);
    return tableData;
  };
  const getComponentsTableColumns = () => {
    console.log(
      "getComponentsTableColumns - componentsMatrix:",
      componentsMatrix
    );

    if (!componentsMatrix || Object.keys(componentsMatrix).length === 0) {
      console.log("No components matrix available, returning default columns");
      return [
        {
          title: "",
          dataIndex: "component",
          key: "component",
          width: "20%",
          render: (value) => (
            <span style={{ fontWeight: "600", color: "#333" }}>
              {value || "No data"}
            </span>
          ),
        },
      ];
    }

    // Obtener las features desde el primer componente
    const componentKeys = Object.keys(componentsMatrix);
    if (componentKeys.length === 0) {
      return [
        {
          title: "",
          dataIndex: "component",
          key: "component",
          width: "20%",
          render: (value) => (
            <span style={{ fontWeight: "600", color: "#333" }}>
              {value || "No data"}
            </span>
          ),
        },
      ];
    }
    const firstComponent = componentsMatrix[componentKeys[0]];
    const features = firstComponent ? Object.keys(firstComponent) : [];

    const featureLabels = {
      bienesyservicios: "Bienes y servicios",
      remuneraciones: "Remuneraciones",
      diascamadisponibles: "Días cama disponibles",
      complejidad: "Complejidad",
      consultas: "Consultas médicas",
      grdxegresos: "Egresos x GRD",
      consultasurgencias: "Consultas de urgencia",
      examenes: "Exámenes",
      quirofanos: "Quirófanos",
    };

    const columns = [
      {
        title: "",
        dataIndex: "component",
        key: "component",
        width: "15%",
        render: (value) => (
          <span style={{ fontWeight: "600", color: "#333" }}>{value}</span>
        ),
      },
    ];

    features.forEach((feature) => {
      columns.push({
        title: featureLabels[feature] || feature,
        dataIndex: feature,
        key: feature,
        width: `${85 / features.length}%`,
        render: (value) => (
          <span
            style={{
              color: value < 0 ? "#ff4d4f" : "#52c41a",
            }}
          >
            {typeof value === "number" ? formatNumber(value, 4) : "0.0000"}
          </span>
        ),
      });
    });

    console.log("Generated columns:", columns);
    return columns;
  };
  const getClusterTableData = () => {
    console.log("getClusterTableData - clusterSummary:", clusterSummary);
    console.log("getClusterTableData - pcaData:", pcaData);

    if (!clusterSummary || Object.keys(clusterSummary).length === 0) {
      console.log("No cluster summary data available");
      return [];
    }

    // El backend devuelve cluster_summary en formato orient='index'
    // Es decir: { "0": {"n_hospitals": 5, "ET DEA": val, "feature1": val, ...}, "1": {...}, ... }
    return Object.entries(clusterSummary).map(([clusterId, data], index) => {
      console.log(`Cluster ${clusterId} data:`, data);
      console.log(`Available keys in cluster ${clusterId}:`, Object.keys(data));

      // Obtener el número de hospitales
      const n_hospitales = data.n_hospitals || data.cluster || 0;

      // Obtener eficiencia técnica (puede ser ET DEA o ET SFA)
      const te_media = data["ET DEA"] || data["ET SFA"] || 0;

      // Para PC1, PC2 y PC3 Media, necesitamos calcularlos desde pcaData
      let pc1_media = 0;
      let pc2_media = 0;
      let pc3_media = 0;

      if (pcaData && pcaData.length > 0) {
        // Filtrar hospitales del cluster actual
        const clusterHospitals = pcaData.filter(
          (hospital) => hospital.cluster === parseInt(clusterId)
        );
        console.log(
          `Hospitals in cluster ${clusterId}:`,
          clusterHospitals.length
        );

        if (clusterHospitals.length > 0) {
          // Calcular promedios
          pc1_media =
            clusterHospitals.reduce((sum, h) => sum + (h.PC1 || 0), 0) /
            clusterHospitals.length;
          pc2_media =
            clusterHospitals.reduce((sum, h) => sum + (h.PC2 || 0), 0) /
            clusterHospitals.length;
          // Solo calcular PC3 si tenemos 3 o más componentes
          if (numComponents >= 3) {
            pc3_media =
              clusterHospitals.reduce((sum, h) => sum + (h.PC3 || 0), 0) /
              clusterHospitals.length;
          }
        }
      }

      console.log(`Calculated values for cluster ${clusterId}:`, {
        n_hospitales,
        te_media,
        pc1_media,
        pc2_media,
        pc3_media,
      });

      const result = {
        key: index + 1,
        cluster: parseInt(clusterId),
        n_hospitales,
        te_media,
        pc1_media,
        pc2_media,
      };

      // Solo agregar PC3 si tenemos 3 o más componentes
      if (numComponents >= 3) {
        result.pc3_media = pc3_media;
      }

      return result;
    });
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
                icon={<BarChartOutlined />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#1890ff",
                }}
                title="N° de componentes"
              />
              <Button
                type="text"
                icon={<ApartmentOutlined />}
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#52c41a",
                }}
                title="N° de clústeres"
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
              {" "}
              <ParameterTooltip
                tooltipData={getTooltip(
                  "pcaCluster",
                  "secciones",
                  "parametrosCalculo"
                )}
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
                    cursor: "help",
                  }}
                >
                  Parámetros de Cálculo
                </Title>
              </ParameterTooltip>
              {/* N° de componentes section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <BarChartOutlined
                  style={{
                    fontSize: "16px",
                    color: "#1890ff",
                    marginRight: "8px",
                  }}
                />
                <ParameterTooltip
                  tooltipData={getTooltip(
                    "pcaCluster",
                    "parametros",
                    "componentes"
                  )}
                >
                  <Title
                    level={5}
                    style={{ margin: 0, color: "#333", cursor: "help" }}
                  >
                    N° de componentes
                  </Title>
                </ParameterTooltip>
              </div>{" "}
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {" "}
                <Slider
                  min={1}
                  max={3}
                  value={numComponents}
                  onChange={(value) => setNumComponents(Math.min(value, 3))}
                  marks={{
                    1: "1",
                    2: "2",
                    3: "3",
                  }}
                  style={{ flex: 1 }}
                />
                <InputNumber
                  min={1}
                  max={3}
                  value={numComponents}
                  onChange={(value) =>
                    setNumComponents(Math.min(value || 1, 3))
                  }
                  style={{ width: "60px" }}
                />
              </div>{" "}
              {maxComponents < 3 && (
                <Alert
                  message="Pocas variables seleccionadas"
                  description={`Con ${
                    state.inputcols.length
                  } variable(s) de entrada y ${
                    state.metodologia === "SFA" ? "1" : state.outputcols.length
                  } variable(s) de salida (${
                    state.metodologia === "SFA"
                      ? "SFA usa solo la primera"
                      : state.metodologia
                  }), solo puede usar máximo ${Math.min(
                    maxComponents,
                    3
                  )} componente(s) PCA. Considere agregar más variables para análisis más complejos.`}
                  type="info"
                  showIcon
                  style={{ marginBottom: "16px", fontSize: "12px" }}
                />
              )}
              {/* N° de clústeres section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <ApartmentOutlined
                  style={{
                    fontSize: "16px",
                    color: "#52c41a",
                    marginRight: "8px",
                  }}
                />
                <ParameterTooltip
                  tooltipData={getTooltip(
                    "pcaCluster",
                    "parametros",
                    "clusters"
                  )}
                >
                  <Title
                    level={5}
                    style={{ margin: 0, color: "#333", cursor: "help" }}
                  >
                    N° de clústeres
                  </Title>
                </ParameterTooltip>
              </div>{" "}
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Slider
                  min={0}
                  max={8}
                  value={numClusters || 0}
                  onChange={(value) =>
                    setNumClusters(value === 0 ? null : value)
                  }
                  marks={{
                    0: "Auto",
                    2: "2",
                    4: "4",
                    6: "6",
                    8: "8",
                  }}
                  style={{ flex: 1 }}
                />
                <InputNumber
                  min={0}
                  max={8}
                  value={numClusters || 0}
                  onChange={(value) =>
                    setNumClusters(value === 0 ? null : value)
                  }
                  style={{ width: "60px" }}
                  placeholder="Auto"
                />
              </div>{" "}
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
                    "pcaCluster",
                    "parametros",
                    "entradas"
                  )}
                >
                  <Title
                    level={5}
                    style={{ margin: 0, color: "#333", cursor: "help" }}
                  >
                    Entradas
                  </Title>
                </ParameterTooltip>
              </div>
              <Select
                mode="multiple"
                placeholder="Seleccionar entradas"
                value={state.inputcols}
                onChange={actions.setInputCols}
                style={{ width: "100%", marginBottom: "16px" }}
                options={availableInputs}
              />{" "}
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
                    "pcaCluster",
                    "parametros",
                    "salidas"
                  )}
                >
                  <Title
                    level={5}
                    style={{ margin: 0, color: "#333", cursor: "help" }}
                  >
                    Salidas
                  </Title>
                </ParameterTooltip>
              </div>
              <Select
                mode="multiple"
                placeholder="Seleccionar salidas"
                value={state.outputcols}
                onChange={actions.setOutputCols}
                style={{ width: "100%", marginBottom: "16px" }}
                options={availableOutputs}
                disabled={state.loading}
              />
              <ActionTooltip
                tooltipData={getTooltip("pcaCluster", "acciones", "calcular")}
              >
                <Button
                  type="primary"
                  size="large"
                  loading={state.loading}
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                  }}
                  onClick={fetchPcaClusterData}
                >
                  {state.loading ? "Calculando..." : "Calcular"}
                </Button>
              </ActionTooltip>
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
            {" "}
            <Title
              level={2}
              style={{
                margin: 0,
              }}
            >
              Análisis de componentes y clusterización
            </Title>{" "}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <ParameterTooltip
                tooltipData={getTooltip("pcaCluster", "parametros", "año")}
              >
                <Select
                  value={state.año}
                  onChange={actions.setAño}
                  style={{ width: 120 }}
                  options={availableYears.map((year) => ({
                    value: year,
                    label: year.toString(),
                  }))}
                />
              </ParameterTooltip>
              <ParameterTooltip
                tooltipData={getTooltip(
                  "pcaCluster",
                  "parametros",
                  "metodologia"
                )}
              >
                <Radio.Group
                  value={state.metodologia}
                  onChange={(e) => actions.setMetodologia(e.target.value)}
                  size="middle"
                >
                  <Radio.Button value="SFA">SFA</Radio.Button>
                  <Radio.Button value="DEA">DEA</Radio.Button>
                </Radio.Group>
              </ParameterTooltip>
            </div>{" "}
          </div>{" "}
          {/* Mostrar errores */}
          {state.error && (
            <div
              style={{
                width: "100%",
                maxWidth: "1200px",
                marginBottom: "16px",
              }}
            >
              <Alert
                message="Error en el análisis"
                description={state.error}
                type="error"
                closable
                onClose={() => actions.setError(null)}
                style={{ marginBottom: "16px" }}
              />
            </div>
          )}
          {/* KPI Cards */}
          <div style={{ width: "100%", maxWidth: "1200px" }}>
            <Row
              gutter={[16, 16]}
              style={{ marginBottom: "8px", justifyContent: "center" }}
            >
              <Col xs={24} sm={8} md={8}>
                <Card
                  style={{
                    textAlign: "center",
                    height: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)",
                    border: "1px solid #91d5ff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "help",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  {" "}
                  <KpiTooltip
                    tooltipData={getTooltip(
                      "pcaCluster",
                      "kpis",
                      "varianzaExplicada"
                    )}
                  >
                    <Statistic
                      title={
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#1890ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <LineChartOutlined />
                          Varianza explicada
                        </span>
                      }
                      value={
                        metrics?.total_variance_explained
                          ? formatNumber(
                              metrics.total_variance_explained * 100,
                              1
                            )
                          : "--"
                      }
                      suffix={metrics?.total_variance_explained ? "%" : ""}
                      valueStyle={{
                        color: "#1890ff",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    />
                  </KpiTooltip>
                </Card>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <Card
                  style={{
                    textAlign: "center",
                    height: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)",
                    border: "1px solid #91d5ff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "help",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  {" "}
                  <KpiTooltip
                    tooltipData={getTooltip(
                      "pcaCluster",
                      "kpis",
                      "numClusters"
                    )}
                  >
                    <Statistic
                      title={
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#1890ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <TeamOutlined />
                          N° Clústeres
                        </span>
                      }
                      value={
                        metrics?.k_clusters !== undefined
                          ? formatNumber(metrics.k_clusters, 0)
                          : numClusters !== null
                          ? formatNumber(numClusters, 0)
                          : "--"
                      }
                      valueStyle={{
                        color: "#1890ff",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    />
                  </KpiTooltip>
                </Card>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <Card
                  style={{
                    textAlign: "center",
                    height: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #f0f9ff 0%, #bae7ff 100%)",
                    border: "1px solid #91d5ff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "help",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  {" "}
                  <KpiTooltip
                    tooltipData={getTooltip("pcaCluster", "kpis", "silhouette")}
                  >
                    <Statistic
                      title={
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#1890ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <TrophyOutlined />
                          Silhouette
                        </span>
                      }
                      value={
                        metrics?.silhouette_score !== undefined
                          ? formatNumber(metrics.silhouette_score, 2)
                          : "--"
                      }
                      valueStyle={{
                        color: "#1890ff",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    />
                  </KpiTooltip>
                </Card>
              </Col>
            </Row>
          </div>
          {/* Sección de Mapa y Tabla */}
          <div style={{ width: "100%", maxWidth: "1200px", marginTop: "32px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
                height: "60px", // Altura fija exacta
              }}
            >
              {" "}
              <ParameterTooltip
                tooltipData={getTooltip(
                  "pcaCluster",
                  "secciones",
                  "componentesClusteres"
                )}
              >
                <Title
                  level={4}
                  style={{
                    marginTop: 10,
                    margin: 0,
                    textAlign: "left",
                    cursor: "help",
                  }}
                >
                  Componentes principales y clústeres
                </Title>
              </ParameterTooltip>
            </div>{" "}
            <Row gutter={[24, 0]} style={{ alignItems: "stretch" }}>
              {" "}
              {/* Gráfico de Correlación */}
              <Col xs={24} lg={10} style={{ display: "flex" }}>
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
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {" "}
                  <ParameterTooltip
                    tooltipData={
                      numComponents >= 3
                        ? getTooltip("pcaCluster", "grafico", "componentes3D")
                        : getTooltip("pcaCluster", "grafico", "componentes2D")
                    }
                  >
                    <Title
                      level={5}
                      style={{
                        marginTop: "0px",
                        marginBottom: "12px",
                        textAlign: "center",
                        cursor: "help",
                      }}
                    >
                      Clusterización{" "}
                      {numComponents >= 3
                        ? "(3D: PC1, PC2, PC3)"
                        : "(2D: PC1, PC2)"}
                    </Title>
                  </ParameterTooltip>
                  {/* Mostrar varianza explicada por componente cuando hay 3D */}
                  {numComponents >= 3 && metrics?.explained_variance_ratio && (
                    <div
                      style={{
                        fontSize: "11px",
                        textAlign: "center",
                        color: "#666",
                        marginBottom: "8px",
                        padding: "4px 8px",
                        backgroundColor: "#f0f9ff",
                        borderRadius: "4px",
                        border: "1px solid #e0f2fe",
                      }}
                    >
                      Varianza explicada: PC1{" "}
                      {(metrics.explained_variance_ratio[0] * 100).toFixed(1)}%,
                      PC2{" "}
                      {(metrics.explained_variance_ratio[1] * 100).toFixed(1)}%
                      {metrics.explained_variance_ratio[2] &&
                        `, PC3 ${(
                          metrics.explained_variance_ratio[2] * 100
                        ).toFixed(1)}%`}
                    </div>
                  )}{" "}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f8f9fa",
                      borderRadius: "6px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    {pcaData && pcaData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            dataKey="PC1"
                            name="PC1"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            type="number"
                            dataKey="PC2"
                            name="PC2"
                            tick={{ fontSize: 12 }}
                          />{" "}
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length > 0) {
                                const data = payload[0].payload;
                                const hospitalName =
                                  data.hospital ||
                                  data.nombre ||
                                  data.hospital_name ||
                                  `Hospital ${data.id || "N/A"}`;

                                return (
                                  <div
                                    style={{
                                      backgroundColor: "white",
                                      border: "1px solid #ccc",
                                      borderRadius: "4px",
                                      padding: "8px",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontWeight: "bold",
                                        marginBottom: "4px",
                                        color: "#333",
                                      }}
                                    >
                                      {hospitalName}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        color: "#666",
                                      }}
                                    >
                                      <div>
                                        PC1: {data.PC1?.toFixed(3) || "N/A"}
                                      </div>
                                      <div>
                                        PC2: {data.PC2?.toFixed(3) || "N/A"}
                                      </div>
                                      {numComponents >= 3 && (
                                        <div>
                                          PC3: {data.PC3?.toFixed(3) || "N/A"}
                                        </div>
                                      )}
                                      <div>Cluster: {data.cluster}</div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend /> {/* Generar un Scatter por cada cluster */}
                          {Array.from(
                            new Set(pcaData.map((d) => d.cluster))
                          ).map((clusterId) => (
                            <Scatter
                              key={clusterId}
                              name={`Cluster ${clusterId}`}
                              data={pcaData.filter(
                                (d) => d.cluster === clusterId
                              )}
                              fill={
                                clusterColors[clusterId % clusterColors.length]
                              }
                              r={3}
                            />
                          ))}
                        </ScatterChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ textAlign: "center", color: "#666" }}>
                        <LineChartOutlined
                          style={{
                            fontSize: "48px",
                            marginBottom: "16px",
                            color: "#1890ff",
                          }}
                        />{" "}
                        <ParameterTooltip
                          tooltipData={getTooltip(
                            "pcaCluster",
                            "grafico",
                            "titulo"
                          )}
                        >
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "500",
                              cursor: "help",
                            }}
                          >
                            {state.loading
                              ? "Cargando..."
                              : "Gráfico de Clusterización"}
                          </div>
                        </ParameterTooltip>
                        <div style={{ fontSize: "14px", marginTop: "8px" }}>
                          {state.loading
                            ? "Procesando datos..."
                            : `Análisis con método: ${state.metodologia}`}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            marginTop: "12px",
                            color: "#999",
                          }}
                        >
                          {state.loading
                            ? "Por favor espere..."
                            : "Haz clic en 'Calcular' para generar el análisis"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Col>{" "}
              {/* Tabla de Resultados Econométricos */}
              <Col xs={24} lg={14} style={{ display: "flex" }}>
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
                    display: "flex",
                    flexDirection: "column",
                    padding: "20px",
                  }}
                >
                  {/* Primera tabla - Matriz de componentes */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "16px",
                    }}
                  >
                    <ParameterTooltip
                      tooltipData={getTooltip(
                        "pcaCluster",
                        "tabla",
                        "matrizComponentes",
                        "titulo"
                      )}
                    >
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "12px",
                          color: "#333",
                          textAlign: "center",
                          cursor: "help",
                        }}
                      >
                        Matriz de Componentes Principales
                      </div>
                    </ParameterTooltip>{" "}
                    <Table
                      columns={getComponentsTableColumns()}
                      dataSource={getComponentsTableData()}
                      pagination={false}
                      size="small"
                      scroll={{ y: "calc(50% - 40px)" }}
                      style={{ flex: 1 }}
                      locale={{
                        emptyText: state.loading ? (
                          <Spin size="small" />
                        ) : (
                          <div style={{ padding: "20px", textAlign: "center" }}>
                            <div>No hay datos disponibles</div>
                            {componentsMatrix &&
                              Object.keys(componentsMatrix).length === 0 && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#999",
                                    marginTop: "8px",
                                  }}
                                >
                                  La matriz de componentes está vacía. Verifique
                                  que el análisis se haya ejecutado
                                  correctamente.
                                </div>
                              )}
                          </div>
                        ),
                      }}
                    />
                  </div>{" "}
                  {/* Segunda tabla - Centroides */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {" "}
                    <ParameterTooltip
                      tooltipData={getTooltip(
                        "pcaCluster",
                        "tabla",
                        "caracterizacionClusters",
                        "titulo"
                      )}
                    >
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "12px",
                          color: "#333",
                          textAlign: "center",
                          cursor: "help",
                        }}
                      >
                        Caracterización de los clústeres
                      </div>
                    </ParameterTooltip>{" "}
                    <Table
                      columns={[
                        {
                          title: "Clúster",
                          dataIndex: "cluster",
                          key: "cluster",
                          width: numComponents >= 3 ? "12%" : "15%",
                          render: (value) => (
                            <span style={{ fontWeight: "600", color: "#333" }}>
                              {value}
                            </span>
                          ),
                        },
                        {
                          title: "N° Hospitales",
                          dataIndex: "n_hospitales",
                          key: "n_hospitales",
                          width: numComponents >= 3 ? "15%" : "20%",
                          render: (value) => (
                            <span style={{ color: "#1890ff" }}>{value}</span>
                          ),
                        },
                        {
                          title: "ET Media",
                          dataIndex: "te_media",
                          key: "te_media",
                          width: numComponents >= 3 ? "15%" : "20%",
                          render: (value) => (
                            <span style={{ color: "#52c41a" }}>
                              {typeof value === "number"
                                ? formatNumber(value, 2)
                                : "0.00"}
                            </span>
                          ),
                        },
                        {
                          title: "Media PC1",
                          dataIndex: "pc1_media",
                          key: "pc1_media",
                          width: numComponents >= 3 ? "19%" : "22%",
                          render: (value) => (
                            <span
                              style={{
                                color:
                                  typeof value === "number" && value < 0
                                    ? "#ff4d4f"
                                    : "#52c41a",
                              }}
                            >
                              {typeof value === "number"
                                ? formatNumber(value, 2)
                                : "0.00"}
                            </span>
                          ),
                        },
                        {
                          title: "Media PC2",
                          dataIndex: "pc2_media",
                          key: "pc2_media",
                          width: numComponents >= 3 ? "19%" : "23%",
                          render: (value) => (
                            <span
                              style={{
                                color:
                                  typeof value === "number" && value < 0
                                    ? "#ff4d4f"
                                    : "#52c41a",
                              }}
                            >
                              {typeof value === "number"
                                ? formatNumber(value, 2)
                                : "0.00"}
                            </span>
                          ),
                        },
                        ...(numComponents >= 3
                          ? [
                              {
                                title: "Media PC3",
                                dataIndex: "pc3_media",
                                key: "pc3_media",
                                width: "20%",
                                render: (value) => (
                                  <span
                                    style={{
                                      color:
                                        typeof value === "number" && value < 0
                                          ? "#ff4d4f"
                                          : "#52c41a",
                                    }}
                                  >
                                    {typeof value === "number"
                                      ? formatNumber(value, 2)
                                      : "0.00"}
                                  </span>
                                ),
                              },
                            ]
                          : []),
                      ]}
                      dataSource={getClusterTableData()}
                      pagination={false}
                      size="small"
                      scroll={{ y: "calc(50% - 40px)" }}
                      style={{ flex: 1 }}
                      locale={{
                        emptyText: state.loading ? (
                          <Spin size="small" />
                        ) : (
                          "No hay datos disponibles"
                        ),
                      }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PcaClusterView;
