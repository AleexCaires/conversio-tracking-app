"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import Modal from "@/components/Modal/Modal";
import {
  ContentWrapper,
  SearchWrapper,
  InputWrapper,
  FilterWrapper,
  ExperienceNameWrapper
} from "./page.styles";

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
  const [nameSearchTerm, setNameSearchTerm] = useState("");
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
  
          const sortedElements = data.elements.sort((a: any, b: any) => {
            return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
          });
  
          setItems(sortedElements);
          setFilteredItems(sortedElements);
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
  
    const filtered = items.filter((item) => {
      const matchesId = item._id.toLowerCase().includes(value);
      const matchesClientName = item.client.toLowerCase().includes(value);
      const matchesClientFilter =
        selectedClient === "" ||
        item.client.toLowerCase() === selectedClient.toLowerCase();
  
      return (matchesId || matchesClientName) && matchesClientFilter;
    });
  
    setFilteredItems(filtered);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClient(value);
  
    const filtered = items.filter((item) => {
      const matchesId = item._id.toLowerCase().includes(searchTerm);
      const matchesClientName = item.client.toLowerCase().includes(searchTerm);
      const matchesClientFilter =
        value === "" || item.client.toLowerCase() === value.toLowerCase();
  
      return (matchesId || matchesClientName) && matchesClientFilter;
    });
  
    setFilteredItems(filtered);
  };
  

  const handleOpenModal = (item: any) => {
    console.log("Selected item:", item);

    const controlGroup = item.events.find(
      (group: any) => group.label === "Dummy Control"
    );
    const variationGroups = item.events.filter(
      (group: any) => group.label !== "Dummy Control"
    );

    const controlEvents = controlGroup?.events || [];
    const variationEvents = variationGroups.flatMap(
      (group: any) => group.events || []
    );

    console.log("Control Events", controlEvents);
    console.log("Variation Events", variationEvents);

    setModalContent({
      controlEvents: controlEvents.map((event: any) =>
        JSON.stringify(event, null, 2)
      ),
      variationEvents: variationEvents.map((event: any) =>
        JSON.stringify(event, null, 2)
      ),
    });

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return (
    <>
      <Header />
      <ContentWrapper>
        <SearchWrapper>
          <InputWrapper>
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
          </InputWrapper>
          <FilterWrapper>
            <h1>Filter by client:</h1>
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
              className="clientSelector"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client.code} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
          </FilterWrapper>
          <ExperienceNameWrapper>

          <h1>Experience Name:</h1>
          <input
            type="text"
            placeholder="Search by name (Coming soon)"
            value={nameSearchTerm}
            onChange={(e) => setNameSearchTerm(e.target.value)}
            style={{
              padding: "0.5rem",
              width: "100%",
              maxWidth: "400px",
              marginBottom: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          </ExperienceNameWrapper>
        </SearchWrapper>

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
        onClick={() => handleOpenModal(item)}
      >
        <p
          style={{
            fontWeight: "bold",
            margin: "0 0 0.5rem 0",
            color: "#333",
          }}
        >
          {item._id}
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
          Date Created: {item.dateCreated}
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
          Client: {item.client}
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
          Experience Name: {item.experienceName}
        </p>
      </div>
    ))
  ) : (
    <p>No matching items found.</p>
  )}
</div>
      </ContentWrapper>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} content={modalContent} />
    </>
  );
};

export default History;
