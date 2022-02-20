import axios from "axios";
import { ACCESS_KEY_ID, SECRET_KEY_ID, COUNT_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS, CHAIN_ID } from '../constants';

const option = {
    headers: {
        Authorization: "Basic " + Buffer.from(ACCESS_KEY_ID + ":" + SECRET_KEY_ID).toString("base64"),
        "x-chain-id": CHAIN_ID,
        "content-type": "application/json",
    }
}


export const uploadMetaData  = async (imageUrl, _posX, _posY) => {
    const _description = "This is Abble Project";
    const _name = "AbbleNFT";

    const metadata = {
        metadata: {
            name: _name,
            description: _description,
            image: imageUrl,
            posX: _posX,
            posY: _posY,
        }
    }

    try{
        const response = await axios.post('https://metadata-api.klaytnapi.com/v1/metadata', metadata, option);
        console.log(`${JSON.stringify(response.data)}`);
        return response.data.uri;
    } catch(e){
        console.log(e);
        return false;
    }
}