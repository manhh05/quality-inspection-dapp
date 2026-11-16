import { ethers } from "ethers";
import QualityInspectionABI from "./contracts/QualityInspectionABI.json";
import { useState, useEffect } from "react";
import "./App.css";

const CONTRACT_ADDRESS = "0x0E6546D54002982d8F05416e24D7D1bcC2CF24Ac";
const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

function App() {
  const [items, setItems] = useState([]);
  const [itemId, setItemId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [inspectionResult, setInspectionResult] = useState("Passed");
  const [message, setMessage] = useState("");

  const [account, setAccount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [role, setRole] = useState("Viewer");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setMessage("Please install MetaMask!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send(
        "eth_requestAccounts",
        []
      );

      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        setMessage("Please switch to Sepolia network!");
        return;
      }

      setAccount(accounts[0]);
      setMessage("Wallet connected successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to connect wallet.");
    }
  }

  function disconnectWallet() {
    setAccount("");
    setItems([]);
    setMessage("Wallet disconnected from this website.");
  }

  async function loadItems() {
    try {

      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        QualityInspectionABI,
        provider
      );

      // Get all registered item IDs
      const ids = await contract.getAllItemIds();

      // Get inspection status for each item
      const loadedItems = await Promise.all(
        ids.map(async (id) => {
          const status = await contract.getInspectionResult(id);

          const statusNames = ["Pending", "Passed", "Failed"];

          return {
            id,
            status: statusNames[Number(status)],
          };
        })
      );

      setItems(loadedItems);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load items from blockchain.");
    }
  }

  async function loadRole(walletAddress) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        setRole("Viewer");
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        QualityInspectionABI,
        provider
      );

      // Get manager and inspector addresses from blockchain
      const managerAddress = await contract.manager();
      const inspectorAddress = await contract.inspector();

      const currentAddress = walletAddress.toLowerCase();

      if (currentAddress === managerAddress.toLowerCase()) {
        setRole("Manager");
      } else if (
        currentAddress === inspectorAddress.toLowerCase()
      ) {
        setRole("Inspector");
      } else {
        setRole("Viewer");
      }
    } catch (error) {
      console.error(error);
      setRole("Viewer");
      setMessage("Failed to load wallet role.");
    }
  }

  useEffect(() => {
    // Always load inspection records, even without wallet
    loadItems();

    if (account) {
      loadRole(account);
    } else {
      setRole("Viewer");
    }
  }, [account]);

  useEffect(() => {
    // Refresh inspection records every 10 seconds
    const interval = setInterval(() => {
      loadItems();
    }, 10000);

    // Stop interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    // Listen for MetaMask account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount("");
        setItems([]);
        setMessage("Wallet disconnected.");
      } else {
        setAccount(accounts[0]);
        setMessage("Wallet account changed.");
      }
    };

    // Listen for network changes
    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Remove listeners when component unmounts
    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );

      window.ethereum.removeListener(
        "chainChanged",
        handleChainChanged
      );
    };
  }, []);

  function getTransactionError(error) {
    console.error("Transaction error:", error);

    // User rejected the transaction in MetaMask
    if (
      error.code === "ACTION_REJECTED" ||
      error.code === 4001 ||
      error.info?.error?.code === 4001
    ) {
      return "Transaction rejected by user.";
    }

    // Insufficient ETH to pay gas
    if (
      error.code === "INSUFFICIENT_FUNDS" ||
      error.message?.toLowerCase().includes("insufficient funds")
    ) {
      return "Insufficient Sepolia ETH to pay gas fees.";
    }

    // Smart contract execution reverted
    if (
      error.code === "CALL_EXCEPTION" ||
      error.receipt?.status === 0
    ) {
      return "Transaction failed on blockchain. Please check the contract conditions.";
    }

    // Network or RPC errors
    if (
      error.code === "NETWORK_ERROR" ||
      error.code === "SERVER_ERROR"
    ) {
      return "Network error. Please check your connection and try again.";
    }

    return "Transaction failed. Please check MetaMask or console.";
  }

  const registerItem = async (e) => {
    e.preventDefault();

    if (isProcessing) return;

    const id = itemId.trim();

    // 1. Check wallet connection
    if (!account) {
      setMessage("Please connect your wallet first.");
      return;
    }

    // 2. Validate item ID
    if (!id) {
      setMessage("Please enter an item ID.");
      return;
    }

    if (items.some((item) => item.id === id)) {
      setMessage("Item ID already exists.");
      return;
    }

    if (items.length >= 50) {
      setMessage("Maximum 50 items allowed.");
      return;
    }

    
    setIsProcessing(true);
    setTransactionHash("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        setMessage("Please switch to Sepolia network.");
        return;
      }

      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        QualityInspectionABI,
        signer
      );

      const manager = await contract.manager();
      const signerAddress = await signer.getAddress();

      if (signerAddress.toLowerCase() !== manager.toLowerCase()) {
        setMessage("Only manager can register items.");
        return;
      }

      // Step 1: Wait for MetaMask
      setMessage("Waiting for MetaMask confirmation...");

      const tx = await contract.registerItem(id);

      // Step 2: Transaction submitted
      setTransactionHash(tx.hash);
      setMessage("Transaction submitted. Waiting for blockchain confirmation...");

      // Step 3: Wait for blockchain
      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error("Transaction failed on blockchain.");
      }

      // Step 4: Refresh blockchain data
      await loadItems();

      setItemId("");
      setMessage(`Item ${id} registered successfully!`);

    } catch (error) {
      setMessage(getTransactionError(error));

    } finally {
      setIsProcessing(false);
    }

  };

  const recordInspection = async (e) => {
    e.preventDefault();

    if (isProcessing) return;

    if (!account) {
      setMessage("Please connect your wallet first.");
      return;
    }

    if (!selectedId) {
      setMessage("Please select an item.");
      return;
    }

    const item = items.find((item) => item.id === selectedId);

    if (!item) {
      setMessage("Item not found.");
      return;
    }

    if (item.status !== "Pending") {
      setMessage("This item has already been inspected.");
      return;
    }

    setIsProcessing(true);
    setTransactionHash("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        setMessage("Please switch to Sepolia network.");
        return;
      }

      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        QualityInspectionABI,
        signer
      );

      const inspector = await contract.inspector();
      const signerAddress = await signer.getAddress();

      if (signerAddress.toLowerCase() !== inspector.toLowerCase()) {
        setMessage("Only inspector can record inspections.");
        return;
      }

      const passed = inspectionResult === "Passed";

      // Step 1: Wait for MetaMask
      setMessage("Waiting for MetaMask confirmation...");

      const tx = await contract.recordInspection(
        selectedId,
        passed
      );

      // Step 2: Transaction submitted
      setTransactionHash(tx.hash);
      setMessage("Transaction submitted. Waiting for blockchain confirmation...");

      // Step 3: Wait for blockchain
      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error("Transaction failed on blockchain.");
      }

      // Step 4: Refresh blockchain data
      await loadItems();

      setSelectedId("");
      setMessage(`Inspection recorded successfully: ${inspectionResult}`);

    } catch (error) {
      setMessage(getTransactionError(error));

    } finally {
      setIsProcessing(false);
    }

  };


  const passed = items.filter(
    (item) => item.status === "Passed"
  ).length;

  const failed = items.filter(
    (item) => item.status === "Failed"
  ).length;

  const pending = items.filter(
    (item) => item.status === "Pending"
  ).length;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Quality Inspection DApp</h1>
          <p>Blockchain-based Product Quality Management</p>
        </div>
        
        <div className="wallet-actions">
          {account ? (
            <>
              <span className="wallet-address">
                {role} | {account.slice(0, 6)}...{account.slice(-4)}
              </span>

              <button
                type="button"
                className="disconnect-btn"
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              className="connect-btn"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div>

      </header>
      
      {message && (
        <div className="message">
          <p>{message}</p>

          {transactionHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Transaction on Sepolia Etherscan
            </a>
          )}
        </div>
      )}

      <main>
        <section className="stats">
          <div className="stat-card total-card">
            <p>Total Items</p>
            <h2>{items.length} / 50</h2>
          </div>

          <div className="stat-card passed-card">
            <p>Passed</p>
            <h2>{passed}</h2>
          </div>

          <div className="stat-card failed-card">
            <p>Failed</p>
            <h2>{failed}</h2>
          </div>

          <div className="stat-card pending-card">
            <p>Pending</p>
            <h2>{pending}</h2>
          </div>
        </section>

        <section className="forms">
          {role === "Manager" && (
            <div className="panel">
              <h2>Register New Item</h2>
              <p>Manager only</p>

              <form onSubmit={registerItem}>
                <label>Item ID</label>
                <input
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  placeholder="e.g. ITEM001"
                />

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Register Item"}
                </button>
              </form>
            </div>
          )}
          
          {role === "Inspector" && (
            <div className="panel">
              <h2>Record Inspection</h2>
              <p>Inspector only</p>

              <form onSubmit={recordInspection}>
                <label>Select Item</label>

                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="">Select an item</option>

                  {items
                    .filter((item) => item.status === "Pending")
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.id}
                      </option>
                    ))}
                </select>

                <label>Inspection Result</label>

                <select
                  value={inspectionResult}
                  onChange={(e) => setInspectionResult(e.target.value)}
                >
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Submit Inspection"}
                </button>
              </form>
            </div>
          )}
        </section>

        <section className="panel table-panel">
          <h2>Inspection Records</h2>

          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Item ID</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty">
                    No items registered yet.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.id}</td>
                    <td>
                      <span
                        className={`status ${item.status.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;
