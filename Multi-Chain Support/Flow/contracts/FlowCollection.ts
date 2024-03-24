import fs from "fs";
import path from "path";
import canvas from "canvas";
import { ProgressBar } from "../../helpers/ProgressBar";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const DNA_DELIMITER = "+";

interface CollectionAttributes {
  name: string;
  dir: fs.PathLike;
  description: string;
  account: string;
  privateKey: string;
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
  account: string;
  privateKey: string;

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
    this.account = attributes.account;
    this.privateKey = attributes.privateKey;
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

  // Setters
  setBaseURL(url: string) {
    this.baseURL = url;
  }

  setAssetsDirCID(cid: string) {
    this.assetsDirCID = cid;
  }

  setMetadataDirCID(cid: string) {
    this.metadataDirCID = cid;
  }

  setExtraMetadata(data: object) {
    this.extraMetadata = data;
  }

  setSchema(schema: LayerSchema) {
    // Function to recursively read images in a Layer directory and return array of Elements
    const getElements = (dir: fs.PathLike, rarityDelimiter: string) => {
      // Functions for extracting name and rarity weight from file name
      // File name is of the form "{name} rarityDelimiter {rarityWeight} . {extension}"
      const cleanName = (str: string) =>
        path.parse(str).name.split(rarityDelimiter).shift();
      const rarityWeight = (str: string) =>
        path.parse(str).name.split(rarityDelimiter).pop();

      return this.readDirElements(dir)
        .filter((item) => !/(^|\/)\.[^/.]/g.test(item))
        .map((i, index) => {
          //Parsing File name
          if (i.includes(DNA_DELIMITER)) {
            throw new Error(
              `File name cannot contain "${DNA_DELIMITER}", please fix: ${i}`
            );
          }
          const eleName = cleanName(i);
          if (!eleName) {
            throw new Error(`Error in loading File ${i}`);
          }
          const eleWeight = i.includes(schema.rarityDelimiter)
            ? rarityWeight(i)
            : schema.rarityDefault;
          if (!eleWeight) {
            throw new Error(`Error in loading File ${i}`);
          }

          // Creating Element
          const element: LayerElement = {
            id: index,
            name: eleName,
            filename: i,
            path: path.join(dir.toString(), i),
            weight: parseInt(eleWeight),
          };
          return element;
        });
    };
  }
}  