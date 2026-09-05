import React, { useState, useEffect, useRef } from "react";
import "./style.css";

function checkStringInListIgnoreCase(stringToCheck, stringList) {
    const lowerCaseString = stringToCheck.toLowerCase();
    return stringList.some(item => item.toLowerCase() === lowerCaseString);
}

function findIndexIgnoreCase(list, searchString) {
    const lowerCaseSearchString = searchString.toLowerCase();
    for (let i = 0; i < list.length; i++) {
        if (list[i].toLowerCase() === lowerCaseSearchString) {
            return i;
        }
    }
    return -1;
}

const AutoComplete = (props) => {
    const [query, setQuery] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [actionBar, setActionBar] = useState(false);

    const textareaRef = useRef(null);
    const dropdownRef = useRef(null);

    // Initialize srcs items
    useEffect(() => {
        setFilteredItems(props.items);
    }, [props.items]);

    // Initial focus
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                textareaRef.current &&
                !textareaRef.current.contains(event.target)
            ) {
                setIsDropdownVisible(false);
                setActionBar(false);
            }
        };

        document.addEventListener("pointerdown", handleClickOutside);
        return () => {
            document.removeEventListener("pointerdown", handleClickOutside);
        };
    }, []);

    // Handle input change
    const handleChange = (event) => {
        const searchQuery = event.target.value;
        setActionBar(true);
        setQuery(searchQuery);

        if (searchQuery === "") {
            setFilteredItems(props.items);
            setHighlightedIndex(0);
        } else {
            setIsDropdownVisible(true);
            const results = props.items.filter(item =>
                item.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredItems(results);
            setHighlightedIndex(results.length > 0 ? 0 : -1);
        }
    };

    const handleSelect = (item) => {
        let finalValue = item;

        if (checkStringInListIgnoreCase(item, props.items)) {
            const selected_index = findIndexIgnoreCase(props.items, item);
            if (selected_index !== -1) {
                finalValue = props.items[selected_index];
            }
        } else if (!props.allowAnyValue && highlightedIndex !== -1) {
            finalValue = props.items[highlightedIndex];
        }

        setQuery(finalValue);
        setActionBar(false);
        setIsDropdownVisible(false);
        props.commit(finalValue);

        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };

    // Keyboard navigation
    const handleKeyDown = (event) => {
        if (event.key === "Backspace" && query === "") {
            props.remove && props.remove();
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex(prev =>
                Math.min(prev + 1, filteredItems.length - 1)
            );
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, 0));
        } else if (event.key === "Enter") {
            if (props.allowAnyValue) {
                handleSelect(query);
            } else if (highlightedIndex !== -1) {
                handleSelect(filteredItems[highlightedIndex]);
            }
        } else if (event.key === "Escape") {
            // ✅ nice UX addition
            setIsDropdownVisible(false);
            setActionBar(false);
        }
    };

    const handleFocus = () => {
        setHighlightedIndex(0);
        setIsDropdownVisible(true);
        setActionBar(true);
    };

    // Prevent focus loss when clicking dropdown items
    const handleDropdownItemMouseDown = (e) => {
        e.preventDefault();
    };

    return (
        <div
            className="autocomplete-container"
            style={{ position: "relative", width: "300px" }}
        >
            <div className="w-100 flex align-center">
                <input
                    type="text"
                    ref={textareaRef}
                    value={query}
                    onChange={handleChange}
                    onClick={handleFocus}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={`[ ${props.placeHolder} ]`}
                    className="autocomplete-input"
                />

                {actionBar &&
                    query.trim() !== "" &&
                    props.allowAnyValue && (
                        <div
                            className="ac-action-btn add-btn"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(query)}
                        >
                            {"✓"}
                        </div>
                    )}
            </div>

            {isDropdownVisible && filteredItems.length > 0 && (
                <ul className="autocomplete-dropdown" ref={dropdownRef}>
                    {filteredItems.map((item, index) => (
                        <li
                            key={index}
                            onMouseDown={handleDropdownItemMouseDown}
                            onClick={() => handleSelect(item)}
                            className={`autocomplete-item ${highlightedIndex === index ? "ac-highlighted" : ""
                                }`}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutoComplete;