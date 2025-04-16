"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import Modal from "@/components/Modal/Modal";

interface ModalContent {
  controlEvents: string[];
  variationEvents: string[];
}

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
  const [items, setItems] = useState([]); // State to store fetched items
  const [filteredItems, setFilteredItems] = useState([]); // State to track filtered elements
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [modalContent, setModalContent] = useState<ModalContent | null>(null); // State to store modal content

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/get-elements");
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched data:", data);
          setItems(data.elements); 
          setFilteredItems(data.elements); 
        } else {
          console.error("Failed to fetch elements");
        }
      } catch (error) {
        console.error("Error fetching elements:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    // Filter items based on the search term and selected client
    const filtered = items.filter((item) => {
      const matchesSearch = item._id.toLowerCase().includes(value); // Assuming _id is the unique identifier
      const matchesClient =
        selectedClient === "" || item.client.startsWith(selectedClient);
      return matchesSearch && matchesClient;
    });

    setFilteredItems(filtered);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClient(value);

    // Filter items based on the selected client and search term
    const filtered = items.filter((item) => {
      const matchesSearch = item._id.toLowerCase().includes(searchTerm); // Assuming _id is the unique identifier
      const matchesClient =
        value === "" || item.client.startsWith(value);
      return matchesSearch && matchesClient;
    });

    setFilteredItems(filtered);
  };


  const handleOpenModal = (item: any) => {
    console.log("Selected item:", item);

    // Separate control events and variation events
    const controlEvents = item.events.filter((event: any) => event.label === "Dummy Control");
    const variationEvents = item.events.filter((event: any) => event.label !== "Dummy Control");

    setModalContent({
      controlEvents: controlEvents.map((event: any) => JSON.stringify(event, null, 2)), // Format as JSON strings
      variationEvents: variationEvents.map((event: any) => JSON.stringify(event, null, 2)), // Format as JSON strings
    });

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    setModalContent(null); // Clear the modal content
  };

  return (
    <div>
      <Header />
      <div style={{ padding: "1rem" }}>
        <h1>Search for specific Events:</h1>
        <input
          type="text"
          placeholder="For Example: OPT100"
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
                  cursor: "pointer",
                }}
                onClick={() => handleOpenModal(item)} // Open modal on click
              >
                <p
                  style={{
                    fontWeight: "bold",
                    margin: "0 0 0.5rem 0",
                    color: "#333",
                  }}
                >
                  {item._id} {/* Assuming _id is the unique identifier */}
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>Date Created: {item.createdAt}</p>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                  Client: {item.client}</p>
              </div>
            ))
          ) : (
            <p>No matching items found.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        content={modalContent}
      />
    </div>
  );
};

export default History;