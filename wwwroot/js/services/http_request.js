

export const httpService = {
    async get(url) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return await response.json();
      } catch (error) {
        console.error('Error en GET:', error);
        throw error;
      }
    },
  
    async post(url, data) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        console.error('Error en POST:', error);
        throw error;
      }
    },

    async put(url, data) {
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        console.error('Error en PUT:', error);
        throw error;
      }
    },

    async delete(url) {
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return await response.json();
      } catch (error) {
        console.error('Error en DELETE:', error);
        throw error;
      }
    },
  };