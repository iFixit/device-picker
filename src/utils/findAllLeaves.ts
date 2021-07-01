import {Hierarchy} from '../types';

function findAllLeaves(hierarchy: Hierarchy, display_titles: Record<string, string>, result: Set<string>): Set<string> {
    for (const key in hierarchy) {
        if (key in display_titles) {
            if (hierarchy[display_titles[key]] === null) {
                result.add(display_titles[key]);
            } else {
                findAllLeaves(hierarchy[key], display_titles, result);
            }
        }
        else {
            if (hierarchy[key] === null) {
                result.add(key);
            } else {
                findAllLeaves(hierarchy[key], display_titles, result);
            }
        }
    }
    return result;
}

export default findAllLeaves;