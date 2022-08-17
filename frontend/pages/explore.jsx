import React from "react";
import ProfileCard from "../src/components/ProfileCard";
import kushagra from "../src/assets/kushagra.jpg";
import dhruv from "../src/assets/dhruv.jpg";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import {
  Creator_Contract_ABI,
  Creator_Contract_address,
} from "../utils/constants";
import { useContract, useProvider } from "wagmi";
// import { useContract, useProvider } from "wagmi";
// import { getRecord } from "../src/components/ceramic";
import { useState, useEffect } from "react";

export default function Explore() {
  const [noId, setNoId] = useState(0);
  const [creators, setCreators] = useState([]);
  const provider = useProvider();

  const Creator_contract = useContract({
    addressOrName: Creator_Contract_address,
    contractInterface: Creator_Contract_ABI,
    signerOrProvider: provider,
  });

  /// fetch the data from the CID from IFPS for both type of datas
  const fetchIPFS = async (_url) => {
    console.log("fetching the files");
    console.log(_url);
    const response = await fetch(_url);
    const data = await response.json();
    return data;
    /// {name , description(bio) , image (pfp), title } --> User profile
  };
  const fetchCreator = async (_id) => {
    try {
      const creator = await Creator_contract.fetchCreators(_id);
      console.log(creator);
      const Userdata = await fetchIPFS(creator.userData);
      console.log(Userdata);
      const parsedData = {
        Id: _id,
        Name: Userdata.name,
        Description: Userdata.description,
        Image: Userdata.pfp,
        Title: Userdata.title,
      };
      console.log(parsedData);
      return parsedData;
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCreators = async () => {
    try {
      const noId = await fetchNoId();
      console.log("Fetching...");
      const promises = [];
      for (let id = 0; id < noId; id++) {
        const creatorPromise = fetchCreator(id);
        promises.push(creatorPromise);
      }
      const data = await Promise.all(promises);
      console.log(data);
      setCreators(data);
      /// render this data array to show all the data on the screen
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNoId = async () => {
    try {
      console.log("fetching the Ids");
      const data = await Creator_contract.id();
      const id = parseInt(data._hex);
      console.log(id);
      /// parse the ID character from the id value and pass it to the user
      setNoId(id);
      return id;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  /// set the right image tage with creator.Image
  return (
    <>
      <div className={styles.explore}>
        <h1 className={styles.section_heading}>Creators</h1>
        <div className={styles.explore_cards}>
          {creators ? (
            creators.map((creator) => {
              return (
                <ProfileCard
                  image={kushagra}
                  name={creator.Name}
                  intro={creator.Description}
                  id={creator.Id}
                />
              );
            })
          ) : (
            <a>No Creators found</a>
          )}
          {/* <ProfileCard
            image={kushagra}
            name={"Kushagra Sarathe"}
            intro={
              "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptate corporis placeat earum at ex illo eos sint a optio natus, saepe doloremque sapiente dolorem sunt, voluptas perspiciatis iure repellendus facilis."
            }
          />
          <ProfileCard
            image={dhruv}
            name={"Dhruv Agarwal"}
            intro={
              "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptate corporis placeat earum at ex illo eos sint a optio natus, saepe doloremque sapiente dolorem sunt, voluptas perspiciatis iure repellendus facilis."
            }
          /> */}
        </div>
      </div>
    </>
  );
}
