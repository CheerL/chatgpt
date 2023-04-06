const config = {
  development: {
    API_URL: "http://192.168.1.6:7040/gpt/api"
    // API_URL: "https://home.cheerl.space:9080/gpt/api"
  },
  production: {
    API_URL: "https://aws.cheerl.space/gpt/api"
  }
};

export default config;
