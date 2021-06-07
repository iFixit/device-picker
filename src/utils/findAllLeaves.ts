var result = new Set();

export interface Object {
    [key: string]: any;
}

function findAllLeaves(hierarchy: Object | any, display_titles: Object | any): Object {
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