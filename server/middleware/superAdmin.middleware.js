const superAdminMiddleware = (req, res, next) => {
    if (req.user.role !== "super_admin") {
        return res.status(403).json({
            success: false,
            message: "Super Admin access only"
        });
    }

    next();
};

module.exports = superAdminMiddleware;
