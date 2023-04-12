import '../styles/globals.css';
import type { AppProps } from 'next/app'
import Link from 'next/link';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import Web3Modal from 'web3modal';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';


export default function App({ Component, pageProps }: AppProps) {


  const [account, setAccount] = useState<string>("");

  async function checkIfWalletConnected() {
    try {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const address = await signer.getAddress();

      setAccount(address)
      console.log(address);

    } catch (e) {
      console.log(e)

    }
  }

  useEffect(() => {
    checkIfWalletConnected()
  })

  return (
    <div>
      <nav className="border-b p-6 font-semibold">
        <p className="text-4xl font-bold">NFT Marketplace</p>
        <div className="flex mt-4">
          <Link href="/" className="mr-4 text-white hover:underline">
            Home
          </Link>
          <Link href="/create-nft" className="mr-6 text-white hover:underline">
            Sell NFT
          </Link>
          <Link href="/my-nfts" className="mr-6 text-white hover:underline">
            My NFTs
          </Link>
          <Link href="/dashboard" className="mr-6 text-white hover:underline">
            Dashboard
          </Link>
          <span className="mr-6 text-white">
            connected: {account}
          </span>
        </div>
      </nav>
      <ThirdwebProvider>
        <Component {...pageProps} />
      </ThirdwebProvider>
    </div>
  )
}
