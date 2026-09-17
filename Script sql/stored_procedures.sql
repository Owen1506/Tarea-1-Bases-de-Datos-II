USE AdventureWorks2022;
GO

CREATE OR ALTER PROCEDURE HumanResources.sp_Department_Insert
    @Name NVARCHAR(50),
    @GroupName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO HumanResources.Department
        (Name, GroupName, ModifiedDate)
    VALUES
        (@Name, @GroupName, GETDATE());

    SELECT SCOPE_IDENTITY() AS DepartmentID;
END;
GO

CREATE OR ALTER PROCEDURE HumanResources.sp_Department_SelectAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        DepartmentID,
        Name,
        GroupName,
        ModifiedDate
    FROM HumanResources.Department;
END;
GO

CREATE OR ALTER PROCEDURE HumanResources.sp_Department_Update
    @DepartmentID SMALLINT,
    @Name NVARCHAR(50),
    @GroupName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE HumanResources.Department
    SET
        Name = @Name,
        GroupName = @GroupName,
        ModifiedDate = GETDATE()
    WHERE DepartmentID = @DepartmentID;
END;
GO

CREATE OR ALTER PROCEDURE HumanResources.sp_Department_Delete
    @DepartmentID SMALLINT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM HumanResources.Department
    WHERE DepartmentID = @DepartmentID;
END;
GO

CREATE OR ALTER PROCEDURE HumanResources.sp_Department_EmployeeCount
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        d.DepartmentID,
        d.Name AS DepartmentName,
        d.GroupName,
        COUNT(edh.BusinessEntityID) AS EmployeeCount
    FROM HumanResources.Department AS d
    LEFT JOIN HumanResources.EmployeeDepartmentHistory AS edh
        ON d.DepartmentID = edh.DepartmentID
        AND edh.EndDate IS NULL
    GROUP BY
        d.DepartmentID,
        d.Name,
        d.GroupName;
END;
GO
