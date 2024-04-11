'use client'
import Head from "next/head";

const Home = () => {
  let web3

  const connectWalletHandler = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
      try {
        await window.ethereum.request({ method: "eth_requestAccounts"})
        web3 = new Web3(window.ethereum)
      } catch(err) {
        console.log(err.message)
      }
    } else {
      alert('Install Meta mask yet ? ')
    }
  }

  return (
    <>
      <Head>
        <title>{"The world's best blockchain-based freelancer community"}</title>
      </Head>
      <nav className="flex justify-between p-10 bg-red-200">
          <div> LOGO </div>
          <button 
            className="border-[2px] border-green-500 p-2 rounded-lg hover:bg-lime-200 ease-in duration-300"
            onClick={connectWalletHandler}
          >
            Connect Wallet
          </button>
      </nav>
    </>
  );
}

export default Home