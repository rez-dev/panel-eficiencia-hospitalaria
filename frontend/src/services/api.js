// Obtener la URL base del backend desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_ADDRESS || 'http://localhost:8000';

class ApiService {
  async fetchSFAMetrics(year = 2014, inputCols = [], outputCols = []) {
    try {
      const params = new URLSearchParams();
      params.append('year', year);
      
      if (inputCols.length > 0) {
        params.append('input_cols', inputCols.join(','));
      }
      if (outputCols.length > 0) {
        params.append('output_cols', outputCols.join(','));
      }      console.log(`Fetching SFA metrics for year ${year} with inputs: ${inputCols.join(', ')} and outputs: ${outputCols.join(', ')}`);

      const response = await fetch(`${API_BASE_URL}/sfa?${params}`);
      if (!response.ok) {
        throw new Error(`Error fetching SFA data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error in fetchSFAMetrics:', error);
      throw error;
    }
  }

  async fetchDEAMetrics(year = 2014, inputCols = [], outputCols = []) {
    try {
      const params = new URLSearchParams();
      params.append('year', year);
      
      if (inputCols.length > 0) {
        params.append('input_cols', inputCols.join(','));
      }
      if (outputCols.length > 0) {
        params.append('output_cols', outputCols.join(','));
      }

      const response = await fetch(`${API_BASE_URL}/dea?${params}`);
      if (!response.ok) {
        throw new Error(`Error fetching DEA data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error in fetchDEAMetrics:', error);
      throw error;
    }
  }

  async fetchMalmquistMetrics(yearT = 2014, yearT1 = 2018, inputCols = [], outputCols = [], topInputCol = null) {
    try {
      const params = new URLSearchParams();
      params.append('year_t', yearT);
      params.append('year_t1', yearT1);
      
      if (inputCols.length > 0) {
        params.append('input_cols', inputCols.join(','));
      }
      if (outputCols.length > 0) {
        params.append('output_cols', outputCols.join(','));
      }
      if (topInputCol) {
        params.append('top_input_col', topInputCol);
      }

      console.log(`Fetching Malmquist metrics from ${yearT} to ${yearT1} with inputs: ${inputCols.join(', ')}, outputs: ${outputCols.join(', ')}, and top input: ${topInputCol || 'none'}`);

      const response = await fetch(`${API_BASE_URL}/malmquist?${params}`);
      if (!response.ok) {
        throw new Error(`Error fetching Malmquist data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error in fetchMalmquistMetrics:', error);
      throw error;
    }
  }

  // Método para obtener ambos análisis al mismo tiempo
  async fetchBothMetrics(year = 2014, inputCols = [], outputCols = []) {
    try {
      const [sfaData, deaData] = await Promise.all([
        this.fetchSFAMetrics(year, inputCols, outputCols),
        this.fetchDEAMetrics(year, inputCols, outputCols)
      ]);
      
      return {
        sfa: sfaData,
        dea: deaData
      };
    } catch (error) {
      console.error('Error fetching both metrics:', error);
      throw error;
    }
  }

  async fetchDeterminantesEfficiency(method, year, inputCols, outputCols, independentVars) {
    try {
      const params = new URLSearchParams({
        method,
        year: year.toString(),
        input_cols: inputCols.join(','),
        output_cols: outputCols.join(','),
        independent_vars: independentVars.join(','),
      });

      console.log(`Fetching determinantes efficiency with method ${method} for year ${year}`);

      const response = await fetch(`${API_BASE_URL}/determinantes-efficiency?${params}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error in fetchDeterminantesEfficiency:', error);
      throw error;
    }
  }

  async fetchPcaClustering(method, year, inputCols, outputCols, nComponents, nClusters) {
    try {
      const params = new URLSearchParams({
        method,
        year: year.toString(),
        input_cols: inputCols.join(','),
        output_cols: outputCols.join(','),
        n_components: nComponents.toString(),
        scale: 'true',
        random_state: '42',
      });

      // Solo agregar k si no es "auto"
      if (nClusters && nClusters !== "auto") {
        params.append('k', nClusters.toString());
      }

      console.log(`Fetching PCA clustering with method ${method} for year ${year}`);

      const response = await fetch(`${API_BASE_URL}/pca-clustering?${params}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error in fetchPcaClustering:', error);
      throw error;
    }
  }
}

export default new ApiService();
