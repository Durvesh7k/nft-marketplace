import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import axios from 'axios';
import Web3Modal from 'web3modal';

import nftMarketAddress from '../config'
import NFTMarketplace from '../contractdata/NFTmarketplace.json'

interface QueryType {
    id: string | string[] | undefined;
    tokenURI: string | string[] | undefined;
}


export default function ResellNFT(): JSX.Element {
    const [formInput, updateFormInput] = useState<{ price: string; image: string }>({ price: '', image: '' });
    const router = useRouter();
    const { id , tokenURI } = router.query;
    const { image, price } = formInput;

    const postData : QueryType = {id , tokenURI};

    useEffect(() => {
        fetchNFT();
    }, [id]);

    async function fetchNFT(): Promise<void> {
        if (!tokenURI) return;
        const meta = await axios.get<{ url: string }>(tokenURI.toString());
        updateFormInput(state => ({ ...state, image: meta.data.url }));
    }

    async function listNFTForSale(): Promise<void> {
        if (!price) return;
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether');
        const contract = new ethers.Contract(nftMarketAddress, NFTMarketplace.abi, signer);
        let listingPrice = await contract.getListingPrice();

        listingPrice = listingPrice.toString();
        const transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice });
        await transaction.wait();

        router.push('/');
    }

    return (
        <div className="flex justify-center text-black">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                {
                    image && (
                        <img className="rounded mt-4" width="350" src={image} alt="NFT" />
                    )
                }
                <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    List NFT
                </button>
            </div>
        </div>
    );
}
