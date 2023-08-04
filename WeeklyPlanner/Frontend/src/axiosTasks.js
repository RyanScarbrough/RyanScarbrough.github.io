import axios from "axios";

const baseUrl = "/api/tasks";

const getAll = () => {
   return axios.get(baseUrl).then((response) => response.data);
};

const create = (taskObj) => {
   return axios.post(baseUrl, taskObj).then((response) => response.data);
};

const updatexPer = (id, xPer) => {
   return axios
      .put(`${baseUrl}/${id}`, xPer)
      .then((response) => response.data);
};

const del = (id) => {
   return axios.delete(`${baseUrl}/${id}`);
};

const exportedObject = {
   getAll,
   create,
   updatexPer,
   del,
};

export default exportedObject;