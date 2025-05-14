"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import Modal from "@/components/Modal/Modal";
import { ContentWrapper, SearchWrapper, InputWrapper, FilterWrapper, ExperienceNameWrapper, ItemCard } from "./page.styles";

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
  { name: "Sephora", code: "SA" },
];

const History = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [nameSearchTerm, setNameSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [originalItems, setOriginalItems] = useState([]); // Store the full list of items
  const [filteredItems, setFilteredItems] = useState([]); // Store the filtered list
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [modalContent, setModalContent] = useState<ModalContent | null>(null); // State to store modal content
  const [experienceNumber, setExperienceNumber] = useState<string | undefined>(undefined);
  const [experienceName, setExperienceName] = useState<string | undefined>(undefined);

  // Add a function to refresh elements after deletion
  const refreshElements = async () => {
    try {
      const res = await fetch("/api/get-elements");
      if (res.ok) {
        const data = await res.json();
        console.log("Refreshed data after deletion:", data);

        const sortedElements = [...data.elements].sort((a: any, b: any) => {
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
    // Using the refreshElements function for initial load
    refreshElements();
  }, []);

  // Create a reusable sorting function to ensure consistency
  const sortByNewestFirst = (items: any[]) => {
    return [...items].sort((a, b) => {
      const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
      const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
      return dateB - dateA; // Newest first
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = originalItems.filter((item) => {
      const matchesId = item._id.toLowerCase().includes(value);
      const matchesClientName = item.client.toLowerCase().includes(value);
      const matchesClientFilter = selectedClient === "" || item.client.toLowerCase() === selectedClient.toLowerCase();

      return (matchesId || matchesClientName) && matchesClientFilter;
    });

    // Use the reusable sorting function
    setFilteredItems(sortByNewestFirst(filtered));
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClient(value);

    const filtered = originalItems.filter((item) => {
      const matchesId = item._id.toLowerCase().includes(searchTerm);
      const matchesClientName = item.client.toLowerCase().includes(searchTerm);
      const matchesClientFilter = value === "" || item.client.toLowerCase() === value.toLowerCase();

      return (matchesId || matchesClientName) && matchesClientFilter;
    });

    // Use the reusable sorting function
    setFilteredItems(sortByNewestFirst(filtered));
  };

  const handleExperienceNameSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setNameSearchTerm(value);

    if (value === "") {
      // If input is cleared, reset filteredItems to the full list (already sorted)
      setFilteredItems([...originalItems]);
    } else {
      // Split the search string into individual words
      const searchWords = value.split(/\s+/).filter((word) => word !== "");
      const filtered = originalItems.filter((item) => {
        const expName = item.experienceName?.toLowerCase() || "";
        // Check if every search word is included in the experienceName
        return searchWords.every((word) => expName.includes(word));
      });
      // Use the reusable sorting function
      setFilteredItems(sortByNewestFirst(filtered));
    }
  };

  const handleOpenModal = (item: any) => {
    console.log("Selected item:", item);

    const controlGroup = item.events.find((group: any) => group.label === "Dummy Control");
    const variationGroups = item.events.filter((group: any) => group.label !== "Dummy Control");

    const controlEvents = controlGroup?.events || [];
    const variationEvents = variationGroups.flatMap((group: any) => group.events || []);

    console.log("Control Events", controlEvents);
    console.log("Variation Events", variationEvents);

    // Pass events as objects
    setModalContent({
      controlEvents: controlEvents, // Pass as objects
      variationEvents: variationEvents, // Pass as objects
    });
    setExperienceNumber(item._id); // Use item._id as experienceNumber
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
            <h1>Search for specific Events:</h1>
            <input type="text" placeholder="For Example: OPT100" value={searchTerm} onChange={handleSearch} />
          </InputWrapper>
          <FilterWrapper>
            <h1>Filter by client:</h1>
            <select value={selectedClient} onChange={handleClientChange} className="clientSelector">
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
            <input type="text" placeholder="Search by Experience Name" value={nameSearchTerm} onChange={handleExperienceNameSearch} />
          </ExperienceNameWrapper>
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        content={modalContent} 
        experienceNumber={experienceNumber} 
        experienceName={experienceName}
        client={selectedClient} // Pass the selected client
        onRefresh={refreshElements} // Pass the refresh function
      />
    </>
  );
};

export default History;
