const [hospitals, setHospitals] = useState([]);
const [loading, setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState(""); // 1. Add error state

const handleHospitalSearch = async (lat, lon) => {
  setLoading(true);
  setErrorMessage(""); // Clear old errors
  
  try {
    const results = await fetchNearbyHospitals(lat, lon);
    setHospitals(results);
    
    if (results.length === 0) {
      setErrorMessage("No hospitals found within your immediate radius.");
    }
  } catch (error: any) {
    // 2. Set the custom error string if the network failover triggers
    setErrorMessage(error.message || "Network timeout. Map services are currently unavailable.");
    setHospitals([]);
  } finally {
    setLoading(false);
  }
};

// 3. Render inside your JSX returns panel:
return (
  <div>
    {loading && <p>Searching medical registries...</p>}
    
    {errorMessage && (
      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md my-2">
        ⚠️ {errorMessage}
      </div>
    )}
    
    {hospitals.map(hospital => (
      <div key={hospital.id}>{hospital.tags.name || "Unnamed Medical Center"}</div>
    ))}
  </div>
);
