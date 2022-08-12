import { BBOX } from "fontkit";

export interface Char {
    code: number;
    char: string;
    path: string;
    bbox: BBOX;
}
