import { useState } from 'react'
import { ethers } from 'ethers'
import { IPFSHTTPClient, create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { useStorageUpload } from "@thirdweb-dev/react"

import nftMarketAddress from './contractdata/config'


import NFTMarketplace from './contractdata/NFTmarketplace.json'

export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState ("")
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()
    const { mutateAsync: upload } = useStorageUpload();
    const [filePath, setFilePath] = useState("");



    async function uploadToIPFS() {
        try{
            const imageURI = await upload({
                data: [filePath],
                options: { uploadWithGatewayUrl: true, uploadWithoutDirectory: true },
            });

            console.log(imageURI[0]);
            setFileUrl(imageURI[0])
    
            const uploadData = await upload({
                data: [{
                    url: imageURI[0],
                    name: formInput.name,
                    description: formInput.description
                }],
                options: { uploadWithGatewayUrl: true, uploadWithoutDirectory: true },
            })
            console.log(uploadData[0])

            return uploadData[0]

        }catch(e){
            console.log(e);
        }


    };




    async function listNFTForSale() {
        try {
            const url = await uploadToIPFS()
            const web3Modal = new Web3Modal()
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)
            const signer = provider.getSigner()

            /* create the NFT */
            const price = ethers.utils.parseUnits(formInput.price, 'ether')
            let contract = new ethers.Contract(nftMarketAddress, NFTMarketplace.abi, signer)
            let listingPrice = await contract.getListingPrice()
            listingPrice = listingPrice.toString()
            let transaction = await contract.createToken(url, price, { value: listingPrice })
            await transaction.wait()
            router.push('/')

        } catch (e) {
            console.log(e)

        }

    }

    return (
        <div className="flex justify-center text-black font-semibold">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    placeholder="Asset Description"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                <input
                    type="file"
                    name="Asset"
                    className="my-4 text-white"
                    onChange={e => setFilePath(e.target.files[0])}
                />
                {
                    fileUrl && (
                        <img className="rounded mt-4" width="350" src={fileUrl} />
                    )
                }
                <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create NFT
                </button>
            </div>
        </div>
    )
}