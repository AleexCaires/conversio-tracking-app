"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header/Header";
import Modal from "@/components/Modal/Modal";
import { ContentWrapper, SearchWrapper, InputWrapper, FilterWrapper, ItemCard } from "./page.styles";
import { ExperienceData, ModalContent as ModalContentType } from "@/types";
import { clients } from "../../lib/clients";

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [originalItems, setOriginalItems] = useState<ExperienceData[]>([]);
  const [filteredItems, setFilteredItems] = useState<ExperienceData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContentType | null>(null);
  const [experienceNumber, setExperienceNumber] = useState<string | undefined>(undefined);
  const [experienceName, setExperienceName] = useState<string | undefined>(undefined);

  // Add a function to refresh elements after deletion
  const refreshElements = async () => {
    try {
      const res = await fetch("/api/get-elements");
      if (res.ok) {
        const data = await res.json();
        console.log("Refreshed data after deletion:", data);

        const sortedElements = [...data.elements].sort((a: ExperienceData, b: ExperienceData) => {
          const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
          const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
          return dateB - dateA;
        });

        setOriginalItems([...sortedElements]);
        setFilteredItems([...sortedElements]);
      } else {
        console.error("Failed to refresh elements");
      }
    } catch (error) {
      console.error("Error refreshing elements:", error);
    }
  };

  useEffect(() => {
    refreshElements();
  }, []);

  // Create a reusable sorting function to ensure consistency
  const sortByNewestFirst = (items: ExperienceData[]): ExperienceData[] => {
    return [...items].sort((a, b) => {
      const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
      const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
      return dateB - dateA;
    });
  };

  const handleUnifiedSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      // If search is empty, apply only client filter
      const filtered = originalItems.filter((item) => {
        return selectedClient === "" || item.client.toLowerCase() === selectedClient.toLowerCase();
      });
      setFilteredItems(sortByNewestFirst(filtered));
    } else {
      const searchWords = value.split(/\s+/).filter((word) => word !== "");

      const filtered = originalItems.filter((item) => {
        // Search in ID and client name (original search logic)
        const matchesId = item._id.toLowerCase().includes(value);
        const matchesClientName = item.client.toLowerCase().includes(value);

        // Search in experience name (support multiple words)
        const expName = item.experienceName?.toLowerCase() || "";
        const matchesExperienceName = searchWords.every((word) => expName.includes(word));

        // Apply client filter
        const matchesClientFilter = selectedClient === "" || item.client.toLowerCase() === selectedClient.toLowerCase();

        return (matchesId || matchesClientName || matchesExperienceName) && matchesClientFilter;
      });

      setFilteredItems(sortByNewestFirst(filtered));
    }
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClient(value);

    if (searchTerm === "") {
      // If no search term, just filter by client
      const filtered = originalItems.filter((item) => {
        return value === "" || item.client.toLowerCase() === value.toLowerCase();
      });
      setFilteredItems(sortByNewestFirst(filtered));
    } else {
      // Re-apply the unified search with new client filter
      const searchWords = searchTerm.split(/\s+/).filter((word) => word !== "");

      const filtered = originalItems.filter((item) => {
        const matchesId = item._id.toLowerCase().includes(searchTerm);
        const matchesClientName = item.client.toLowerCase().includes(searchTerm);
        const expName = item.experienceName?.toLowerCase() || "";
        const matchesExperienceName = searchWords.every((word) => expName.includes(word));
        const matchesClientFilter = value === "" || item.client.toLowerCase() === value.toLowerCase();

        return (matchesId || matchesClientName || matchesExperienceName) && matchesClientFilter;
      });

      setFilteredItems(sortByNewestFirst(filtered));
    }
  };

  const handleOpenModal = (item: ExperienceData) => {
    console.log("Selected item for modal in historyComp:", item);
    setModalContent(item);
    setExperienceNumber(item._id);
    setExperienceName(item.experienceName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setExperienceNumber(undefined);
    setExperienceName(undefined);
  };

  return (
    <>
      <Header />
      <ContentWrapper>
        <SearchWrapper>
          <InputWrapper>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleUnifiedSearch}
                style={{
                  paddingLeft: "2.2rem",
                  height: "40px",
                  lineHeight: "40px",
                  boxSizing: "border-box"
                }}
                autoComplete="off"
              />
              <span
                className="search-icon"
                style={{
                  position: "absolute",
                  left: "0.7rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  pointerEvents: "none"
                }}
              >
                {/* Outlined search SVG */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#888"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "block" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {searchTerm === "" && (
                  <>
                    <span
                      style={{
                        margin: "0 0.15rem 0 0.3rem",
                        color: "#ccc",
                        fontWeight: 400,
                        fontSize: "1.1rem",
                        userSelect: "none"
                      }}
                    >
                      |
                    </span>
                    <span
                      style={{
                        color: "#bbb",
                        fontSize: "1rem",
                        fontWeight: 400,
                        userSelect: "none"
                      }}
                    >
                      Search
                    </span>
                  </>
                )}
              </span>
            </div>
          </InputWrapper>
          <FilterWrapper>
            <select value={selectedClient} onChange={handleClientChange} className="clientSelector">
              <option value="">All Clients</option>
              {[...clients]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((client) => (
                  <option key={client.code} value={client.name}>
                    {client.name}
                  </option>
                ))}
            </select>
          </FilterWrapper>
        </SearchWrapper>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between" }}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <ItemCard key={index} onClick={() => handleOpenModal(item)}>
                <p className="itemCode">{item._id}</p>
                <p className="experienceName">{item.experienceName}</p>
                <div className="bottomContainer">
                  <p className="clientName">{item.client}</p>
                  <p className="date">
                    {new Date(item.dateCreated).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </p>
                </div>
              </ItemCard>
            ))
          ) : (
            <p>No matching items found.</p>
          )}
        </div>
      </ContentWrapper>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} content={modalContent} experienceNumber={experienceNumber} experienceName={experienceName} client={modalContent?.client} onRefresh={refreshElements} />
    </>
  );
};

export default History;
