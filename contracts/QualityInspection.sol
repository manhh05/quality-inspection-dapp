
 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;

 contract QualityInspection {

     address public manager;
     address public inspector;


    // Inspection status
    enum Status {
        Pending,
        Passed,
        Failed
    }

    // Product information
    struct Item {
        string itemId;
        bool exists;
        Status status;
    }

    // Store items by their IDs
    mapping(string => Item) public items;

    // List of registered item IDs
    string[] public itemIds;

    // Number of passed items
    uint256 public passedCount;


     constructor(address _inspector) {
         manager = msg.sender;
         inspector = _inspector;
     }


    function registerItem(string memory _itemId) public {
        // Only manager can register items
        require(
            msg.sender == manager,
            "Only manager can register items"
        );

        // Item ID cannot be empty
        require(
            bytes(_itemId).length > 0,
            "Item ID cannot be empty"
        );

        // Prevent duplicate item IDs
        require(
            !items[_itemId].exists,
            "Item already exists"
        );

        // Maximum 50 items
        require(
            itemIds.length < 50,
            "Maximum 50 items reached"
        );

        // Create a new item
        items[_itemId] = Item({
            itemId: _itemId,
            exists: true,
            status: Status.Pending
        });

        // Add ID to the list
        itemIds.push(_itemId);
    }


    function recordInspection(
        string memory _itemId,
        bool _passed
    ) public {
        // Only inspector can record inspections
        require(
            msg.sender == inspector,
            "Only inspector can record inspections"
        );

        // Item must exist
        require(
            items[_itemId].exists,
            "Item does not exist"
        );

        // Item must not have been inspected before
        require(
            items[_itemId].status == Status.Pending,
            "Item already inspected"
        );

        // Record inspection result
        if (_passed) {
            items[_itemId].status = Status.Passed;
            passedCount++;
        } else {
            items[_itemId].status = Status.Failed;
        }
    }


    // Get inspection result of an item
    function getInspectionResult(
        string memory _itemId
    ) public view returns (Status) {
        require(
            items[_itemId].exists,
            "Item does not exist"
        );

        return items[_itemId].status;
    }

    // Get total number of passed items
    function getPassedCount()
        public
        view
        returns (uint256)
    {
        return passedCount;
    }


    // Get all registered item IDs
    function getAllItemIds()
        public
        view
        returns (string[] memory)
    {
        return itemIds;
    }


 }
