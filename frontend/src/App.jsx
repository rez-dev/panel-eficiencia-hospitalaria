import React, { useState } from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Typography } from "antd";
import InicioView from "./components/InicioView";
import EficienciaView from "./components/EficienciaView";
import ComparacionView from "./components/ComparacionView";
import DeterminantesView from "./components/DeterminantesView";
import PcaClusterView from "./components/PcaClusterView";
import InfoView from "./components/InfoView";
const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const items1 = [
  {
    key: "inicio",
    label: "Inicio",
  },
  {
    key: "eficiencia",
    label: "Eficiencia",
  },
  {
    key: "comparar",
    label: "Comparar",
  },
  {
    key: "determinantes",
    label: "Determinantes",
  },
  {
    key: "pca-cluster",
    label: "PCA & Clúster",
  },
  {
    key: "info",
    label: "Info",
  },
];
const App = () => {
  const [currentView, setCurrentView] = useState("inicio");
  const [selectedHospitals, setSelectedHospitals] = useState([]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e) => {
    setCurrentView(e.key);
  };

  // Función de navegación que puede recibir datos adicionales
  const handleNavigate = (view, data = null) => {
    setCurrentView(view);
    if (view === "comparar" && data) {
      setSelectedHospitals(data);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "inicio":
        return <InicioView onNavigate={handleNavigate} />;
      case "eficiencia":
        return <EficienciaView onNavigate={handleNavigate} />;
      case "comparar":
        return <ComparacionView selectedHospitals={selectedHospitals} />;
      case "determinantes":
        return <DeterminantesView onNavigate={handleNavigate} />;
      case "pca-cluster":
        return <PcaClusterView onNavigate={handleNavigate} />;
      case "info":
        return <InfoView onNavigate={handleNavigate} />;
      default:
        return <InicioView onNavigate={handleNavigate} />;
    }
  };
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{ display: "flex", alignItems: "center", padding: "0 16px" }}
      >
        <div
          style={{
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            marginRight: "24px",
            whiteSpace: "nowrap",
          }}
        >
          ET Dashboard
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[currentView]}
          items={items1}
          style={{ flex: 1, minWidth: 0 }}
          onClick={handleMenuClick}
        />
      </Header>
      {renderView()}
    </Layout>
  );
};
export default App;
