const PageWrapper = ({ children }: any) => {
    return (
        <div className="flex h-screen w-screen">
            <div className="m-auto">{children}</div>
        </div>
    );
};
export default PageWrapper;
