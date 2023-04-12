import { BigNumber, ethers } from 'ethers'
import { MouseEventHandler, useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import {
    nftMarketAddress
} from './contractdata/config'

interface itemType {
    price: string,
    tokenId: number,
    seller: string,
    owner: string,
    image: string,
    name: string,
    description: string,
    tokenURI : string
}

interface iType {
    tokenId: BigNumber,
    price: BigNumber,
    seller: string,
    owner: string,
}

import NFTMarketplace from './contractdata/NFTmarketplace.json'

export default function Home() {
    const [nfts, setNfts] = useState<itemType[]>([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const router = useRouter();

    useEffect(() => {
        loadNFTs()
    }, [])
    async function loadNFTs() {
        /* create a generic provider and query for unsold market items */
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner();
        const contract = new ethers.Contract(nftMarketAddress, NFTMarketplace.abi, signer)
        const data = await contract.fetchMyNFTs()
        /*
        *  map over items returned from smart contract and format 
        *  them as well as fetch their token metadata
        */
        const items: itemType[] = await Promise.all(data.map(async (i: iType) => {
            const tokenUri = await contract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            console.log(typeof tokenUri);
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item: itemType = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.url,
                name: meta.data.name,
                description: meta.data.description,
                tokenURI : tokenUri
            }
            return item
        }))
        setNfts(items)
        console.log(items)
        setLoadingState('loaded')
    }

    function listNFT(nft : itemType) {
        router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
    }
    

    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No nfts owned</h1>)
    return (
        <div className="flex justify-center">
            <div className="px-4" style={{ maxWidth: '1600px' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft: itemType, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <img src={nft.image} />
                                <div className="p-4">
                                    <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                                    <div style={{ height: '70px', overflow: 'hidden' }}>
                                        <p className="text-gray-400">{nft.description}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                                    <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>Sell</button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}