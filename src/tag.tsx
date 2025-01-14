import React, {memo} from "react";

/**
 * Render a single tag.
 * - param tag The tag to display.
 * - param onSearchTag The mouse "onClick" function for when the tag is clicked upon.
 * @constructor
 */
function Tag(
    {
        tag,
        onSearchTag
    }: {
        tag: string;
        onSearchTag: (e: React.MouseEvent<HTMLHeadingElement, MouseEvent>, tag: string) => void;
    }) {

    return (
        <div key={tag}
             title="Ctrl + Click to search. Click to list files."
             className="cft-tag"
             onClick={(e) => onSearchTag(e, tag)}
        >
            <span className="cm-formatting cm-formatting-hashtag cm-hashtag cm-hashtag-begin cm-meta">#</span>
            <span className="cm-hashtag cm-hashtag-end cm-meta" spellCheck="false">{tag.substring(1)}</span>
        </div>
    );
}

export default memo(Tag);
