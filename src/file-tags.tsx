import {App} from "obsidian";
import React, {memo, useCallback, useState} from "react";
import Tag from "./tag";
import TagFiles from "./tag-files";


/**
 * Render the tags belong to the file.
 * - param app The Obsidian App.
 * - param tags String array of tags (with #).
 * - param onSearchTag Function to search for a specific tag.
 * @constructor
 */
function FileTags(
    {
        app,
        tags,
        onSearchTag
    }: {
        app: App;
        tags: string[];
        onSearchTag: (tag: string) => void;
    }) {

    // Holds the user's clicked upon tag
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    if (selectedTag && !tags.contains(selectedTag)) {
        // The selected tag is not one of the tags, so clear it.
        // This happens when the active file changed.
        setSelectedTag(null);
    }

    /**
     * Search the tag on an OnClick event.
     * If the Ctrl or Meta key is pressed on the onClick, then use the Search plugin;
     * else, by default, list the files containing the selected tag.
     * @param event The MouseEvent.
     * @param tag The tag to search (with #).
     */
    const searchTag = useCallback(
        (event: React.MouseEvent<HTMLHeadingElement, MouseEvent>, tag: string) => {
            if (event.ctrlKey || event.metaKey) {
                // Search using the Search plugin.
                onSearchTag(tag);
            } else {
                // Search using the selected tag.
                setSelectedTag(tag);
            }
        }, [1]);
    // Using useCallback minimized the rerendering of Tag a bit, but somehow it still does

    return (
        <div>
            <div id="cft-tags-container">
                {tags?.map((tag) => (
                    <Tag
                        key={tag}
                        tag={tag}
                        onSearchTag={searchTag}
                    />
                ))}
            </div>

            <TagFiles
                app={app}
                tag={selectedTag}/>
        </div>
    );
}

export default memo(FileTags);
