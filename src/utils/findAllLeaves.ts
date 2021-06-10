import {Hierarchy} from '../types';
var result = new Set<string>();

interface Map {
    [key: string]: string;
}

function findAllLeaves(hierarchy: Hierarchy, display_titles: Map): Set<string> {
    for (const key in hierarchy) {
        if (key in display_titles) {
            if (hierarchy[display_titles[key]] === null) {
                result.add(display_titles[key]);
            } else {
                findAllLeaves(hierarchy[key], display_titles);
            }
        }
        else {
            if (hierarchy[key] === null) {
                result.add(key);
            } else {
                findAllLeaves(hierarchy[key], display_titles);
            }
        }
    }
    return result;
}

export default findAllLeaves;