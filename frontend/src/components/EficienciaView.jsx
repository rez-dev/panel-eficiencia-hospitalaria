import React, { useState } from "react";
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
} from "antd";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const EficienciaView = ({ onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [entradas, setEntradas] = useState([]);
  const [salidas, setSalidas] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [calculationMethod, setCalculationMethod] = useState("DEA");
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [anoInicial, setAnoInicial] = useState(2020);
  const [anoFinal, setAnoFinal] = useState(2024);

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
        title: "SE Promedio",
        value: 0.923,
        precision: 3,
        color: "#722ed1",
        icon: <ClockCircleOutlined />,
        gradient: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
        border: "#f0e6ff",
      },
    ],
    "DEA-M": [
      {
        title: "ΔProd total",
        value: 12.5,
        precision: 1,
        color: "#1890ff",
        icon: <LineChartOutlined />,
        gradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        border: "#e8f4f8",
        suffix: "%",
      },
      {
        title: "ΔET Promedio",
        value: 0.034,
        precision: 3,
        color: "#52c41a",
        icon: <TrophyOutlined />,
        gradient: "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
        border: "#f0f9e8",
      },
      {
        title: "ΔTech (%)",
        value: 8.7,
        precision: 1,
        color: "#fa8c16",
        icon: <TeamOutlined />,
        gradient: "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)",
        border: "#fff1f0",
        suffix: "%",
      },
      {
        title: "% Hosp. con MPI > 1",
        value: 67.3,
        precision: 1,
        color: "#722ed1",
        icon: <ClockCircleOutlined />,
        gradient: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
        border: "#f0e6ff",
        suffix: "%",
      },
    ],
  };

  const currentKpis = kpiConfigs[calculationMethod];

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
  // Configuración de selección de filas
  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys, selectedRowsData) => {
      // Limitar a máximo 2 selecciones
      if (selectedRowKeys.length <= 2) {
        setSelectedRows(selectedRowKeys);
        console.log("Filas seleccionadas:", selectedRowKeys, selectedRowsData);
      }
    },
    getCheckboxProps: (record) => ({
      disabled: selectedRows.length >= 2 && !selectedRows.includes(record.key),
      name: record.hospital,
    }),
  };
  // Columnas de la tabla
  const columns = [
    {
      title: "Hospital",
      dataIndex: "hospital",
      key: "hospital",
      width: "50%",
      ...getColumnSearchProps("hospital"),
    },
    {
      title: "Eficiencia Técnica",
      dataIndex: "eficiencia",
      key: "eficiencia",
      width: "25%",
      render: (value) => `${value}%`,
      sorter: (a, b) => a.eficiencia - b.eficiencia,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Percentil",
      dataIndex: "percentil",
      key: "percentil",
      width: "25%",
      render: (value) => `${value}°`,
      sorter: (a, b) => a.percentil - b.percentil,
      sortDirections: ["descend", "ascend"],
    },
  ];

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
                        { value: 2015, label: "2015" },
                        { value: 2016, label: "2016" },
                        { value: 2017, label: "2017" },
                        { value: 2018, label: "2018" },
                        { value: 2019, label: "2019" },
                        { value: 2020, label: "2020" },
                        { value: 2021, label: "2021" },
                        { value: 2022, label: "2022" },
                        { value: 2023, label: "2023" },
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
              </div>
              <Select
                mode="multiple"
                placeholder="Seleccionar entradas"
                value={entradas}
                onChange={setEntradas}
                style={{ width: "100%", marginBottom: "16px" }}
                options={[
                  { value: "remuneraciones", label: "Remuneraciones" },
                  { value: "bienes-servicios", label: "Bienes y Servicios" },
                  { value: "dias-cama", label: "Días de cama disponibles" },
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
                onChange={setSalidas}
                style={{ width: "100%", marginBottom: "24px" }}
                options={[
                  {
                    value: "consultas-emergencia",
                    label: "Consultas emergencia",
                  },
                  { value: "egresos-grd", label: "Egresos x GRD" },
                  { value: "consultas-medicas", label: "Consultas médicas" },
                  { value: "examenes", label: "Exámenes" },
                  {
                    value: "intervenciones-quirurgicas",
                    label: "Intervenciones quirúrgicas",
                  },
                ]}
              />
              <Button
                type="primary"
                size="large"
                style={{
                  width: "100%",
                  marginTop: "20px",
                  backgroundColor: "#1890ff",
                  borderColor: "#1890ff",
                }}
                onClick={() => {
                  const logData = { entradas, salidas };
                  if (calculationMethod === "DEA-M") {
                    logData.anoInicial = anoInicial;
                    logData.anoFinal = anoFinal;
                  }
                  console.log("Calculando con:", logData);
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
              Eficiencia técnica hospitalaria
            </Title>{" "}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {calculationMethod !== "DEA-M" && (
                <Select
                  value={selectedYear}
                  onChange={setSelectedYear}
                  style={{ width: 120 }}
                  options={[
                    { value: 2020, label: "2020" },
                    { value: 2021, label: "2021" },
                    { value: 2022, label: "2022" },
                    { value: 2023, label: "2023" },
                    { value: 2024, label: "2024" },
                  ]}
                />
              )}
              <Radio.Group
                value={calculationMethod}
                onChange={(e) => setCalculationMethod(e.target.value)}
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
              <Title
                level={4}
                style={{ marginTop: 10, margin: 0, textAlign: "left" }}
              >
                Distribución y Ranking de Hospitales
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
                      onClick={() => {
                        console.log(
                          "Comparar hospitales seleccionados:",
                          selectedRows
                        );
                        // Obtener los datos completos de los hospitales seleccionados
                        const selectedHospitals = tableData.filter((hospital) =>
                          selectedRows.includes(hospital.key)
                        );

                        // Navegar a la vista de comparación
                        if (onNavigate) {
                          onNavigate("comparar", selectedHospitals);
                        }
                      }}
                    >
                      Comparar{" "}
                      {selectedRows.length === 1 ? "Hospital" : "Hospitales"} (
                      {selectedRows.length})
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
                    />
                    <MapLegend />
                    {tableData.map((hospital) => (
                      <Marker
                        key={hospital.key}
                        position={[hospital.lat, hospital.lng]}
                        icon={getMarkerIcon(hospital.eficiencia)}
                      >
                        <Popup>
                          <div
                            style={{ textAlign: "center", minWidth: "150px" }}
                          >
                            <strong>{hospital.hospital}</strong>
                            <br />
                            <span style={{ color: "#666" }}>
                              {hospital.region}
                            </span>
                            <br />
                            <span
                              style={{ color: "#1890ff", fontWeight: "bold" }}
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
                  <Table
                    columns={columns}
                    dataSource={tableData}
                    rowSelection={rowSelection}
                    pagination={{
                      pageSize: 8,
                      showSizeChanger: false,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} de ${total} hospitales`,
                    }}
                    size="middle"
                    scroll={{ x: 600, y: "calc(100% - 120px)" }}
                    style={{
                      flex: 1,
                    }}
                  />
                </div>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default EficienciaView;
