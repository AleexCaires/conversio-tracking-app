"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";

const clients = [
  { name: "Finisterre", code: "FN" },
  { name: "Liverpool FC", code: "LF" },
  { name: "Phase Eight", code: "PH" },
  { name: "Hobbs", code: "HO" },
  { name: "Whistles", code: "WC" },
  { name: "Laithwaites", code: "LT" },
  { name: "Accessorize", code: "AS" },
  { name: "Monsoon", code: "MS" },
  { name: "Ocado", code: "OPT" },
  { name: "Team Sport", code: "TS" },
];

const History = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(""); 
  const [selectedClient, setSelectedClient] = useState(""); 
  const [items] = useState([
    { name: "OPT101", dateCreated: "2023-01-15" },
    { name: "LT102", dateCreated: "2023-02-20" },
    { name: "PH021", dateCreated: "2023-03-10" },
    { name: "PH056", dateCreated: "2023-04-05" },
    { name: "AS092", dateCreated: "2023-05-12" },
  ]); // Example list of elements with creation dates
  const [filteredItems, setFilteredItems] = useState(items); // State to track filtered elements

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    // Filter items based on the search term and selected client
    const filtered = items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(value);
      const matchesClient =
        selectedClient === "" || item.name.startsWith(selectedClient);
      return matchesSearch && matchesClient;
    });

    setFilteredItems(filtered);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClient(value);

    // Filter items based on the selected client and search term
    const filtered = items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm);
      const matchesClient =
        value === "" || item.name.startsWith(value);
      return matchesSearch && matchesClient;
    });

    setFilteredItems(filtered);
  };

  const handleGoBack = () => {
    router.push("/"); // Navigate to the homepage
  };

  return (
    <div>
      <Header />
      <div style={{ padding: "1rem" }}>
        <button
          onClick={handleGoBack}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
        <h1>See All Content</h1>
        <p>Search for specific elements:</p>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            padding: "0.5rem",
            width: "100%",
            maxWidth: "400px",
            marginBottom: "1rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <p>Filter by client:</p>
        <select
          value={selectedClient}
          onChange={handleClientChange}
          style={{
            padding: "0.5rem",
            width: "100%",
            maxWidth: "400px",
            marginBottom: "1rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <option value="">All Clients</option>
          {clients.map((client) => (
            <option key={client.code} value={client.code}>
              {client.name}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  minWidth: "150px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontWeight: "bold",
                    margin: "0 0 0.5rem 0",
                    color: "#333",
                  }}
                >
                  {item.name}
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                  Date Created: {item.dateCreated}
                </p>
              </div>
            ))
          ) : (
            <p>No matching items found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;