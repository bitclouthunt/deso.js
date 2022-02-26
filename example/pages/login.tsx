import { useState, useEffect } from "react";
import { Identity } from "deso.js";

const identity = new Identity();

export default function Login() {
  const [publicKey, setPublicKey] = useState(null);

  const handleBitCloutSuccess = async (response: any) => {
    const pk = response.publicKey;
    setPublicKey(response.publicKey);
  };

  const handleBitCloutFailure = async (err: Error) => {
    alert("BitClout login failed");
    console.error(err);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div>
          <BitCloutLoginButton
            accessLevel={2}
            onSuccess={handleBitCloutSuccess}
            onFailure={handleBitCloutFailure}
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Logged in user:</p>
            <p className="text-sm font-medium text-gray-700">{publicKey}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const BitCloutLoginButton = ({
  onSuccess,
  onFailure,
  accessLevel,
}: {
  onSuccess: (user: any) => void;
  onFailure: (e: Error) => void;
  accessLevel: number;
}) => {
  const handleLogin = async () => {
    try {
      const response = await identity.login({ accessLevel });
      const publicKey = response.publicKeyAdded;
      const user = response.users[publicKey];
      onSuccess({
        publicKey,
        ...user,
      });
    } catch (err) {
      onFailure(err as Error);
    }
  };

  return (
    <div>
      <button
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={handleLogin}
      >
        <span className="flex items-center">Login with DeSo Identity</span>
      </button>
    </div>
  );
};
