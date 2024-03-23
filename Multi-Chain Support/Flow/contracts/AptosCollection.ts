import fs from "fs";
import path from "path";
import { createCanvas, Image } from "canvas";
import { ProgressBar } from "../../helpers/ProgressBar";

const DNA_DELIMITER = "+";

interface LayerInput {
    name: string;
    dir?: fs.PathLike;
}

interface LayerSchema {
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
}

interface CollectionAttributes {
    name: string;
    dir: fs.PathLike;
    description: string;
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
    description: string;
    uri: string;
    supply: number;
    maximum: number;
    properties: { [key: string]: any }; // Customizable properties

    baseURL = "";
    assetsDirCID = "";
    metadataDirCID = "";

    dir: fs.PathLike;
    layers: Layer[] = [];

    constructor(tokenData: TokenData, dir: fs.PathLike) {
        this.name = tokenData.name;
        this.description = tokenData.description;
        this.uri = tokenData.uri;
        this.supply = tokenData.supply;
        this.maximum = tokenData.maximum;
        this.properties = tokenData.properties;

        this.dir = dir;
    }

    // Functions to access file system
    initializeDir() {
        // Making empty directory for generated NFTs
        if (!fs.existsSync(this.dir.toString())) {
            fs.mkdirSync(this.dir.toString(), { recursive: true });
            fs.mkdirSync(path.join(this.dir.toString(), "assets"));
            fs.mkdirSync(path.join(this.dir.toString(), "metadata"));
        }
    }

    async loadImage(element: LayerElement): Promise<Image> {
        try {
            return new Promise<Image>(async (resolve) => {
                const image = await createCanvas(1, 1);
                const ctx = image.getContext("2d");
                const img = await canvas.loadImage(element.filename);
                ctx.drawImage(img, 0, 0);
                resolve(image);
            });
        } catch (error) {
            console.error(`Error loading image ${element.filename}:`, error);
            throw error;
        }
    }

    saveImage(index: number, canvasInstance: any) {
        fs.writeFileSync(
            path.join(this.dir.toString(), "assets", `${index}.png`),
            canvasInstance.toBuffer("image/png")
        );
    }

    saveMetadata(metadata: Metadata, index: number) {
        // Instead of writing metadata directly to file, store the URI of metadata off-chain
        const metadataFilename = `${index}.json`;
        const metadataPath = path.join(this.dir.toString(), "metadata", metadataFilename);
        const metadataURI = `${this.uri}/metadata/${metadataFilename}`;

        // Update metadata URI
        metadata.image = `${this.uri}/assets/${index}.png`;

        // Save metadata URI
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        // Update metadata URI in properties
        this.properties.metadataURI = metadataURI;
    }
}
