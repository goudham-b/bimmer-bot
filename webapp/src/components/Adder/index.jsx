import React, { useEffect, useState, useRef } from "react"
import './style.css'
import AutoComplete from "./Autocomplete";

const Adder = (props) => {

    const [attributeList, setAttributeList] = useState([]);
    const [attributeValue, setAttributeValue] = useState();

    const [functionList, setFunctionList] = useState([]);
    const [functionValue, setFunctionValue] = useState();

    const [valueList, setValueList] = useState([]);
    const [fieldValue, setFieldValue] = useState();

    const [dataList, setDataList] = useState([]);

    const [placeHolder, setPlaceHolder] = useState({
        "attribute": "Field",
        "function": "Function",
        "value": "Value",
    });

    const [activityTracker, setActivityTracker] = useState({
        "attribute": false,
        "function:": false,
        "value": false
    });

    useEffect(() => {
        setAttributeList(Object.keys(props.schema));
    }, [props.schema])

    useEffect(() => {
        try {
            if (attributeValue != "") {
                setFunctionList(props.schema[attributeValue]["function"]);
            }
        } catch (error) {
            console.log("")
        }

    }, [attributeValue])

    const commitAttribute = (value) => {
        if (value !== "") {
            setAttributeValue(value)
            setActivityTracker({
                "attribute": true,
                "function": false,
                "value": false
            });
        }
    }

    const commitFunction = (value) => {
        if (value !== "") {
            setFunctionValue(value);
            setActivityTracker({
                "attribute": true,
                "function": true,
                "value": false
            });
        }
    }

    const commitValue = (value) => {
        if (value !== "") {
            setFieldValue(value)
            setActivityTracker({
                "attribute": false,
                "function": false,
                "value": false
            });


            commitData({
                "attribute": attributeValue,
                "function": functionValue,
                "value": value
            })
        }
    }

    const commitData = (data) => {
        console.log(data)
        setDataList(
            (prev) => {
                return prev.some(
                    items =>
                        items["attribute"] == data["attribute"] &&
                        items["function"] == data["function"] &&
                        items["value"] == data["value"]
                )
                    ?
                    prev
                    :
                    [...prev, data]
            }
        );
    }


    const Chip = (_props) => {
        return (
            <div className="chip-container">
                <div className="chip-text">
                    <span className="chip-attribute">{_props.attribute}</span>
                    <span className="chip-function">{_props.function}</span>
                    <span className="chip-value">{_props.value}</span>
                </div>
                <div className="chip-btn remove-btn">
                    {"✕"}
                </div>
            </div>
        )
    }

    return (
        <>
            {
                dataList.map(
                    item =>
                        <Chip
                            attribute={item["attribute"]}
                            function={item["function"]}
                            value={item["value"]}
                        />
                )
            }
            {/* Attributes */}
            {
                !activityTracker["attribute"] &&
                <AutoComplete
                    items={attributeList}
                    commit={commitAttribute}
                    placeHolder={placeHolder["attribute"]}
                />
            }
            {
                activityTracker["attribute"] && !fieldValue &&
                <span className="active-text">
                    {attributeValue}
                </span>
            }

            {/* Function */}
            {
                activityTracker["attribute"] &&
                !activityTracker["function"] &&
                <AutoComplete
                    items={functionList}
                    commit={commitFunction}
                    placeHolder={placeHolder["function"]}
                    remove={() => {
                        setActivityTracker({
                            "attribute": false,
                            "function:": false,
                            "value": false
                        })
                    }}
                />
            }
            {
                activityTracker["function"] && !fieldValue &&
                <span className="active-text">
                    {functionValue}
                </span>
            }

            {/* Value */}
            {
                activityTracker["attribute"] &&
                activityTracker["function"] &&
                !activityTracker["value"] &&
                <AutoComplete
                    items={valueList}
                    commit={commitValue}
                    placeHolder={placeHolder["value"]}
                    allowAnyValue
                    remove={() => {
                        setActivityTracker({
                            "attribute": true,
                            "function:": false,
                            "value": false
                        })
                    }}
                />
            }
            {
                activityTracker["value"] && !fieldValue &&
                <span className="active-text">
                    {fieldValue}
                </span>
            }

        </>
    )
}

export default Adder;