import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faComputer, faChartLine, faRightLong, faRefresh, faDownload } from '@fortawesome/free-solid-svg-icons';
import Chart from 'react-apexcharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState({});

  // Refs para cada gráfico
  const historicoRef = useRef(null);
  const marcasRef = useRef(null);
  const movimientosRef = useRef(null);

  // Función para obtener datos del dashboard desde la API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5000/dashboard/estadisticas');
      
      if (!response.ok) {
        throw new Error('Error al obtener datos del dashboard');
      }
      
      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Función para exportar gráfico a PDF
  const exportChartToPDF = async (chartRef, chartName, chartTitle) => {
    if (!chartRef.current) return;

    try {
      setExporting(prev => ({ ...prev, [chartName]: true }));

      // Esperar un momento para que el gráfico se renderice completamente
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(chartRef.current, {
        scale: 2, // Mejor calidad
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calcular dimensiones para mantener proporción
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgHeight / imgWidth;
      const pdfImgWidth = pdfWidth - 20; // Margen
      const pdfImgHeight = pdfImgWidth * ratio;

      // Título del reporte
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(chartTitle, pdfWidth / 2, 15, { align: 'center' });

      // Fecha de generación
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 22, { align: 'center' });

      // Agregar la imagen del gráfico
      pdf.addImage(imgData, 'PNG', 10, 30, pdfImgWidth, pdfImgHeight);

      // Pie de página
      pdf.setFontSize(8);
      pdf.text('Sistema de Gestión de Equipos - Reporte Generado Automáticamente', pdfWidth / 2, pdfHeight - 10, { align: 'center' });

      // Guardar el PDF
      pdf.save(`reporte-${chartName}-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    } finally {
      setExporting(prev => ({ ...prev, [chartName]: false }));
    }
  };

  // Funciones específicas para cada gráfico
  const exportHistoricoPDF = () => exportChartToPDF(
    historicoRef, 
    'historico-ingresos', 
    'Reporte - Histórico de Ingresos'
  );

  const exportMarcasPDF = () => exportChartToPDF(
    marcasRef, 
    'distribucion-marcas', 
    'Reporte - Distribución de Marcas de Equipos'
  );

  const exportMovimientosPDF = () => exportChartToPDF(
    movimientosRef, 
    'distribucion-movimientos', 
    'Reporte - Distribución de Tipos de Ingreso'
  );

  // Función para exportar todos los gráficos en un solo PDF
  const exportAllToPDF = async () => {
    try {
      setExporting(prev => ({ ...prev, all: true }));

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const charts = [
        { ref: historicoRef, title: 'Histórico de Ingresos' },
        { ref: marcasRef, title: 'Distribución de Marcas' },
        { ref: movimientosRef, title: 'Distribución de Tipos de Ingreso' }
      ];

      for (let i = 0; i < charts.length; i++) {
        if (i > 0) pdf.addPage(); // Nueva página para cada gráfico después del primero

        const chart = charts[i];
        if (!chart.ref.current) continue;

        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(chart.ref.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgHeight / imgWidth;
        const pdfImgWidth = pdfWidth - 20;
        const pdfImgHeight = pdfImgWidth * ratio;

        // Título
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(chart.title, pdfWidth / 2, 15, { align: 'center' });

        // Fecha
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 22, { align: 'center' });

        // Imagen
        pdf.addImage(imgData, 'PNG', 10, 30, pdfImgWidth, pdfImgHeight);

        // Pie de página
        pdf.setFontSize(8);
        pdf.text(`Página ${i + 1} de ${charts.length} - Sistema de Gestión de Equipos`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      }

      pdf.save(`reporte-completo-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error al exportar todos los gráficos:', error);
      alert('Error al generar el PDF completo.');
    } finally {
      setExporting(prev => ({ ...prev, all: false }));
    }
  };

  // Opciones para gráficos
  const ventasOptions = {
    chart: {
      id: 'ingresos-chart',
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: dashboardData?.historico_ingresos?.map(item => item.mes) || []
    },
    colors:['#22bc2b'],
    title: {
      text: 'Histórico de Ingresos (últimos 6 meses)',
      align: 'center'
    }
  };

  const ingresosSerie = [{
    name: 'Ingresos',
    data: dashboardData?.historico_ingresos?.map(item => item.ingresos) || [0, 0, 0, 0, 0, 0]
  }];

  const getMarcasOptions = () => ({
    labels: dashboardData?.marcas?.map(item => item.marca) || [],
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#00D9E9'],
    title: {
      text: 'Distribución de Marcas de Equipos',
      align: 'center'
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, { seriesIndex, w }) {
        return w.config.series[seriesIndex];
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#fff']
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Equipos',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    }
  });

  const getMovimientosOptions = () => ({
    labels: dashboardData?.tipos_ingreso?.map(item => item.tipo) || [],
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560'],
    title: {
      text: 'Distribución de Tipos de Ingreso',
      align: 'center'
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, { seriesIndex, w }) {
        return w.config.series[seriesIndex];
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#fff']
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Ingresos',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    }
  });

  const marcasSeries = dashboardData?.marcas?.map(item => item.cantidad) || [];
  const movimientosSeries = dashboardData?.tipos_ingreso?.map(item => item.cantidad) || [];

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="loading-spinner">Cargando datos del dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            <FontAwesomeIcon icon={faRefresh} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Métricas rápidas
  const totalMarcas = dashboardData?.marcas?.length || 0;
  const totalTiposIngreso = dashboardData?.tipos_ingreso?.length || 0;
  const totalIngresos6Meses = (dashboardData?.historico_ingresos || [])
    .reduce((sum, item) => sum + (Number(item.ingresos) || 0), 0);

  return (
    <div className="dashboard-content">
      {/* Hero superior con acciones */}
      <div className="dashboard-hero">
        <div className="hero-text">
          <h1 className="dashboard-title">Panel de Control</h1>
          <p className="hero-subtitle">Visualiza tendencias y distribuciones clave del sistema</p>
        </div>
        <div className="header-actions">
          <button onClick={exportAllToPDF} className="export-all-button" disabled={exporting.all}>
            <FontAwesomeIcon icon={faDownload} />
            {exporting.all ? 'Generando PDF...' : 'Exportar todo'}
          </button>
          <button onClick={fetchDashboardData} className="refresh-button">
            <FontAwesomeIcon icon={faRefresh} /> Actualizar
          </button>
        </div>
      </div>

      {/* Métricas resumen */}
      <div className="dashboard-row">
        <div className="summary-card">
          <div className="summary-item metric-card">
            <span className="summary-label">Ingresos últimos 6 meses</span>
            <span className="summary-value">{totalIngresos6Meses}</span>
          </div>
          <div className="summary-item metric-card">
            <span className="summary-label">Marcas registradas</span>
            <span className="summary-value">{totalMarcas}</span>
          </div>
          <div className="summary-item metric-card">
            <span className="summary-label">Tipos de ingreso</span>
            <span className="summary-value">{totalTiposIngreso}</span>
          </div>
        </div>
      </div>

      {/* Gráfico de histórico de ingresos */}
      <div className="dashboard-row">
        <div className="dashboard-card large card-modern">
          <div className="card-header">
            <FontAwesomeIcon icon={faChartLine} className="card-icon" />
            <h3>Histórico de Ingresos</h3>
          </div>
          <div ref={historicoRef}>
            {dashboardData?.historico_ingresos && dashboardData.historico_ingresos.length > 0 ? (
              <Chart
                options={ventasOptions}
                series={ingresosSerie}
                type="area"
                height={250}
              />
            ) : (
              <div className="no-data-message">No hay datos disponibles</div>
            )}
          </div>
          <div className="card-actions">
            <button
              onClick={exportHistoricoPDF}
              className="export-button"
              disabled={exporting['historico-ingresos']}
            >
              <FontAwesomeIcon icon={faFilePdf} />
              {exporting['historico-ingresos'] ? 'Generando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Gráficos de distribución */}
      <div className="dashboard-row">
        <div className="dashboard-card card-modern">
          <div className="card-header">
            <FontAwesomeIcon icon={faComputer} className="card-icon" />
            <h3>Distribución de Marcas</h3>
          </div>
          <div ref={marcasRef}>
            {marcasSeries && marcasSeries.length > 0 ? (
              <Chart
                options={getMarcasOptions()}
                series={marcasSeries}
                type="donut"
                height={280}
              />
            ) : (
              <div className="no-data-message">No hay datos disponibles</div>
            )}
          </div>
          <div className="card-actions">
            <button
              onClick={exportMarcasPDF}
              className="export-button"
              disabled={exporting['distribucion-marcas']}
            >
              <FontAwesomeIcon icon={faFilePdf} />
              {exporting['distribucion-marcas'] ? 'Generando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>

        <div className="dashboard-card card-modern">
          <div className="card-header">
            <FontAwesomeIcon icon={faRightLong} className="card-icon" />
            <h3>Distribución de Tipos de Ingreso</h3>
          </div>
          <div ref={movimientosRef}>
            {movimientosSeries && movimientosSeries.length > 0 ? (
              <Chart
                options={getMovimientosOptions()}
                series={movimientosSeries}
                type="donut"
                height={280}
              />
            ) : (
              <div className="no-data-message">No hay datos disponibles</div>
            )}
          </div>
          <div className="card-actions">
            <button
              onClick={exportMovimientosPDF}
              className="export-button"
              disabled={exporting['distribucion-movimientos']}
            >
              <FontAwesomeIcon icon={faFilePdf} />
              {exporting['distribucion-movimientos'] ? 'Generando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;