import React, { useEffect, useState } from 'react';
import { getPatients, deletePatient } from '../api/patientService';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaEye, FaTrash, FaFilePdf } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import SuperAdminLayout from './Layouts/SuperAdminLayout';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchFilter, setSearchFilter] = useState({ type: '', value: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      const token = JSON.parse(localStorage.getItem('user')).token;
      const data = await getPatients(token);
      console.log(data)
      setPatients(data);
      setFilteredPatients(data);
    };
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    const token = JSON.parse(localStorage.getItem('user')).token;
    await deletePatient(id, token);
    setPatients((prevPatients) => prevPatients.filter((patient) => patient._id !== id));
    setFilteredPatients((prevFiltered) => prevFiltered.filter((patient) => patient._id !== id));
  };

  const handleFilterChange = (key, value) => {
    setSearchFilter({ ...searchFilter, [key]: value });
  };

  const handleSearch = () => {
    if (!searchFilter.type || !searchFilter.value) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter((patient) =>
        patient[searchFilter.type]?.toLowerCase().includes(searchFilter.value.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Generate PDF for patient details
  const handleDownloadPdf = async (patient) => {
    const doc = new jsPDF();

    // Create a temporary HTML structure for the patient's data
    const patientDetails = `
      <div>
        <h2>Patient Details</h2>
        <p><strong>Name:</strong> ${patient.name}</p>
        <p><strong>Aadhar Number:</strong> ${patient.aadharNumber}</p>
        <p><strong>Age:</strong> ${patient.age}</p>
        <p><strong>Address:</strong> ${patient.address}</p>
        <p><strong>State:</strong> ${patient.state}</p>
        <p><strong>City:</strong> ${patient.city}</p>
        <p><strong>Mobile:</strong> ${patient.mobile}</p>
        <p><strong>Gender:</strong> ${patient.gender}</p>
      </div>
    `;

    const tempElement = document.createElement('div');
    tempElement.innerHTML = patientDetails;
    document.body.appendChild(tempElement);

    const canvas = await html2canvas(tempElement);
    const imgData = canvas.toDataURL('image/png');

    doc.addImage(imgData, 'PNG', 10, 10, 180, 160);
    doc.save(`${patient.name}_details.pdf`);

    document.body.removeChild(tempElement);
  };

  return (
    <SuperAdminLayout>
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-[#302C51]">Patient List</h1>

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <select
            value={searchFilter.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="p-2 border border-gray-300 rounded w-full sm:w-auto"
          >
            <option value="">Select Filter</option>
            <option value="name">Name</option>
            <option value="city">City</option>
            <option value="district">District</option>
            <option value="state">State</option>
            <option value="country">Country</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchFilter.type || '...'}`}
            value={searchFilter.value}
            onChange={(e) => handleFilterChange('value', e.target.value)}
            onKeyPress={handleKeyPress}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-[#302C51] text-white">
                <th className="py-2 px-4 border">S. No.</th>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Aadhar Number</th>
                <th className="py-2 px-4 border">Age</th>
                <th className="py-2 px-4 border">Address</th>
                <th className="py-2 px-4 border">State</th>
                <th className="py-2 px-4 border">City</th>
                <th className="py-2 px-4 border">Mobile</th>
                <th className="py-2 px-4 border">Gender</th>
                <th className="py-2 px-4 border">Operation</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, index) => (
                <tr key={patient._id} className="text-center">
                  <td className="py-2 px-4 border">{index + 1}</td>
                  <td className="py-2 px-4 border">{patient.name}</td>
                  <td className="py-2 px-4 border">{patient.aadharNumber}</td>
                  <td className="py-2 px-4 border">{patient.age}</td>
                  <td className="py-2 px-4 border">{patient.address}</td>
                  <td className="py-2 px-4 border">{patient.state}</td>
                  <td className="py-2 px-4 border">{patient.city}</td>
                  <td className="py-2 px-4 border">{patient.mobile}</td>
                  <td className="py-2 px-4 border">{patient.gender}</td>
                  <td className="py-2 px-4 border">
                    <div className="flex justify-center gap-1 sm:gap-2">
                      <button
                        onClick={() => navigate(`/admin/patients/${patient._id}`)}
                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/patients/${patient._id}/edit`)}
                        className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                      >
                        <FaUserEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                      >
                        <FaTrash size={14} />
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(patient)}
                        className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                      >
                        <FaFilePdf size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default PatientList;
