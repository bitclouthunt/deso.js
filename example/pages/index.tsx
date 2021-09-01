import { useState, useEffect } from "react";
import axios from "axios";

const USER_PUBLIC_KEY =
  "BC1YLhp9Zf6Yykr7V14zxqeoLS1AbsvExpkgMdVVuT3TDniEhD8htJ1";

export default function Home() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      fetchProfile(USER_PUBLIC_KEY);
    }
    fetchData();
  }, []);

  const fetchProfile = async (publicKey: string) => {
    console.log("fetch");
    const data = await axios.get(`/api/profile/${publicKey}`);
    console.log(data?.data);
    setProfile(data?.data);
  };

  return (
    <div>
      <h1>bitclout-sdk example</h1>
      <div>
        <h2>Fetching users profile</h2>
        <p>An example of fetching a users profile via backend API</p>
        <h4>Results:</h4>

        {!profile ? (
          "Loading..."
        ) : (
          <div>
            Username: {profile?.Profile.Username}
            <br />
            Description: {profile?.Profile.Description}
            <br />
          </div>
        )}
      </div>
    </div>
  );
}
