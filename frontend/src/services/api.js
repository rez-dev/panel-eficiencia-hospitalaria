const API_BASE_URL = 'http://localhost:8000';

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
}

export default new ApiService();
