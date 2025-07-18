import React from "react";

const Footer = () => {
  return (
    <>
      <footer
        data-aos="fade-up"
        className="mt-12 mb-4 border-t-2 dark:border-gray-400 border-gray-700 pt-4"
      >
        <div className="flex justify-center flex-col items-center text-center py-4 text-zinc-800 heading-1 dark:text-white heading-1 w-10/12 mx-auto">
          <span className="text-sm font-semibold tracking-wide pb-5 uppercase">
            &copy; {new Date().getFullYear()} VANSH KAPADIA.{" "}
          </span>
          <span className="text-sm font-medium tracking-wide uppercase">
            All rights reserved -- Just Kidding This Is Just A Project For
            Learning!!
          </span>
        </div>
      </footer>
    </>
  );
};

export default Footer;
