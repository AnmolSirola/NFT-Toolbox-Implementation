import { program } from '@project-serum/anchor/dist/cjs/native/system';
import { Keypair, Connection, PublicKey, sendAndConfirmTransaction, Transaction, TransactionSignature, TransactionInstruction } from '@solana/web3.js';

import fs from "fs";
import path from "path";
import canvas from "canvas";
import { ProgressBar } from "../../helpers/ProgressBar";

const DNA_DELIMITER = "+";

interface CollectionAttributes {
	name: string;
	dir: fs.PathLike;
	description: string;
  programId: PublicKey;
  account: PublicKey;
}

export interface LayerSchema {
	dir: fs.PathLike;
	size: number;
	layersOrder: LayerInput[];
	format: {
		width: number;
		height: number;
		smoothing: boolean;
	};
	background: {
		generate: boolean;
		static?: boolean;
		default?: string;
		brightness?: number;
	};
	dnaCollisionTolerance: number;
	rarityDelimiter: string;
	rarityDefault: string;
	shuffleIndexes: boolean;
  connection: Connection;
  payer: Keypair;
}

interface LayerInput {
	name: string;
	dir?: fs.PathLike;
}

interface LayerElement {
	id: number;
	name: string;
	filename: string;
	path: string;
	weight: number;
}
interface Layer {
	id: number;
	name: string;
	elements: LayerElement[];
	totalWeight: number;
}
interface MetadataAttribute {
	trait_type: string;
	value: string;
}
interface Metadata {
	name: string;
	description: string;
	image: string;
	attributes: MetadataAttribute[];
}

export class Collection {
  name: string;
	dir: fs.PathLike;
	description = "";
  programId: PublicKey;
  account: PublicKey;

  baseURL = "";
	assetsDirCID = "";
	metadataDirCID = "";

	extraMetadata: object = {};
	schema?: LayerSchema = undefined;
	layers?: Layer[] = undefined;

  constructor(attributes: CollectionAttributes) {
		this.name = attributes.name;
		this.description = attributes.description;
		this.dir = attributes.dir;
    this.programId = attributes.programId;
    this.account = attributes.account;
	}

  // Functions to access file system
	initializeDir() {
		// Making empty directory for generated NFTs
		if (!this.schema || !this.layers) {
			throw new Error("Schema required for generating NFTs");
		}
		if (fs.existsSync(this.dir)) {
			fs.rmSync(this.dir, { recursive: true });
		}
		fs.mkdirSync(this.dir);
		fs.mkdirSync(path.join(this.dir.toString(), "assets"));
		fs.mkdirSync(path.join(this.dir.toString(), "metadata"));
	}

  readDirElements(dir: fs.PathLike) {
		return fs.readdirSync(dir);
	}
	async loadImage(element: LayerElement) {
		try {
			// eslint-disable-next-line no-async-promise-executor
			return new Promise<canvas.Image>(async (resolve) => {
				const image = await canvas.loadImage(element.path);
				resolve(image);
			});
		} catch (error) {
			console.error(`Error loading image ${element.path}:`, error);
		}
	}
	saveImage(_index: number, canvasInstance: canvas.Canvas) {
		fs.writeFileSync(
			path.join(this.dir.toString(), "assets", `${_index}.png`),
			canvasInstance.toBuffer("image/png")
		);
	}
	saveMetadata(metadata: Metadata, _index: number) {
		fs.writeFileSync(
			path.join(this.dir.toString(), "metadata", `${_index}.json`),
			JSON.stringify(metadata, null, 2)
		);
	}
