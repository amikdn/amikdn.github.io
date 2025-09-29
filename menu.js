(function () {
    'use strict';

    // Plugin metadata
    var plugin = {
        type: 'menu',
        version: '1.0.0',
        name: 'Custom Menu',
        description: 'Custom menu for Lampa with logo, time, and sports integration'
    };

    // Menu HTML structure
    var menuHTML = `
        <div class="scroll__body" style="transform: translate3d(0px, 0px, 0px);">
            <div class="menu">
                <div class="menu__header">
                    <div class="menu__header-logo">
                        <img src="./img/logo_menu.svg" alt="PRISMA">
                    </div>
                    <div class="menu__header-time">
                        <div class="menu__time-now time--clock"></div>
                        <div class="menu__time-date time--full"></div>
                        <div class="menu__time-week time--week"></div>
                    </div>
                </div>
                <div class="menu__case">
                    <ul class="menu__list">
                        <li class="menu__item selector binded" data-action="main">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.07 2.82009L3.14002 8.37008C2.36002 8.99008 1.86002 10.3001 2.03002 11.2801L3.36002 19.2401C3.60002 20.6601 4.96002 21.8101 6.40002 21.8101H17.6C19.03 21.8101 20.4 20.6501 20.64 19.2401L21.97 11.2801C22.13 10.3001 21.63 8.99008 20.86 8.37008L13.93 2.8301C12.86 1.9701 11.13 1.97009 10.07 2.82009Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M12 15.5C13.3807 15.5 14.5 14.3807 14.5 13C14.5 11.6193 13.3807 10.5 12 10.5C10.6193 10.5 9.5 11.6193 9.5 13C9.5 14.3807 10.6193 15.5 12 15.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="menu__text">Главная</div>
                        </li>
                        <li class="menu__item selector binded" data-action="movie">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M9.1001 12V10.52C9.1001 8.60999 10.4501 7.83999 12.1001 8.78999L13.3801 9.52999L14.6601 10.27C16.3101 11.22 16.3101 12.78 14.6601 13.73L13.3801 14.47L12.1001 15.21C10.4501 16.16 9.1001 15.38 9.1001 13.48V12Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="menu__text">Фильмы</div>
                        </li>
                        <li class="menu__item selector binded" data-action="tv">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.25998 2H16.73C17.38 2 17.96 2.02003 18.48 2.09003C21.25 2.40003 22 3.70001 22 7.26001V13.58C22 17.14 21.25 18.44 18.48 18.75C17.96 18.82 17.39 18.84 16.73 18.84H7.25998C6.60998 18.84 6.02998 18.82 5.50998 18.75C2.73998 18.44 1.98999 17.14 1.98999 13.58V7.26001C1.98999 3.70001 2.73998 2.40003 5.50998 2.09003C6.02998 2.02003 6.60998 2 7.25998 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M13.58 8.32007H17.2599" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M6.73999 14.11H6.75998H17.27" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M7 22H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M7.1947 8.30005H7.20368" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M10.4945 8.30005H10.5035" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="menu__text">Сериалы</div>
                        </li>
                        <li class="menu__item selector binded" data-action="cartoons">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M15.5 9.75C16.3284 9.75 17 9.07843 17 8.25C17 7.42157 16.3284 6.75 15.5 6.75C14.6716 6.75 14 7.42157 14 8.25C14 9.07843 14.6716 9.75 15.5 9.75Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M8.5 9.75C9.32843 9.75 10 9.07843 10 8.25C10 7.42157 9.32843 6.75 8.5 6.75C7.67157 6.75 7 7.42157 7 8.25C7 9.07843 7.67157 9.75 8.5 9.75Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M8.4 13.3H15.6C16.1 13.3 16.5 13.7 16.5 14.2C16.5 16.69 14.49 18.7 12 18.7C9.51 18.7 7.5 16.69 7.5 14.2C7.5 13.7 7.9 13.3 8.4 13.3Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="menu__text">Детям</div>
                        </li>
                        <li class="menu__item selector binded" data-action="anime">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 20.07V12.18C22 6.57999 17.5 2 12 2C6.5 2 2 6.57999 2 12.18V20.07C2 21.33 2.74998 21.67 3.66998 20.83L4.66998 19.92C5.03998 19.58 5.64001 19.58 6.01001 19.92L8.01001 21.75C8.38001 22.09 8.97998 22.09 9.34998 21.75L11.35 19.92C11.72 19.58 12.32 19.58 12.69 19.92L14.69 21.75C15.06 22.09 15.66 22.09 16.03 21.75L18.03 19.92C18.4 19.58 19 19.58 19.37 19.92L20.37 20.83C21.25 21.67 22 21.33 22 20.07Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M8 14C10.37 15.78 13.63 15.78 16 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="menu__text">Аниме</div>
                        </li>
                        <li class="menu__item selector binded" data-action="collections">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.01 2.92007L18.91 5.54007C20.61 6.29007 20.61 7.53007 18.91 8.28007L13.01 10.9001C12.34 11.2001 11.24 11.2001 10.57 10.9001L4.67 8.28007C2.97 7.53007 2.97 6.29007 4.67 5.54007L10.57 2.92007C11.24 2.62007 12.34 2.62007 13.01 2.92007Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M3 11C3 11.84 3.63 12.81 4.4 13.15L11.19 16.17C11.71 16.4 12.3 16.4 12.81 16.17L19.6 13.15C20.37 12.81 21 11.84 21 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M3 16C3 16.93 3.55 17.77 4.4 18.15L11.19 21.17C11.71 21.4 12.3 21.4 12.81 21.17L19.6 18.15C20.45 17.77 21 16.93 21 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="menu__text">Подборки</div>
                        </li>
                        <li class="menu__item selector binded" data-action="filter">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.37 8.87988H17.62" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M6.38 8.87988L7.13 9.62988L9.38 7.37988" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M12.37 15.8799H17.62" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M6.38 15.8799L7.13 16.6299L9.38 14.3799" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="menu__text">Фильтр</div>
                        </li>
                        <li class="menu__item selector binded" data-action="favorite">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="menu__text">Избранное</div>
                        </li>
                        <li class="menu__item selector binded" data-action="history">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.33 7.51001C10.83 7.36001 11.38 7.26001 12 7.26001C14.76 7.26001 17 9.50001 17 12.26C17 15.02 14.76 17.26 12 17.26C9.24 17.26 7 15.02 7 12.26C7 11.23 7.31 10.28 7.84 9.48001" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M9.62 7.64999L11.28 5.73999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M9.62 7.6499L11.56 9.0699" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="menu__text">История</div>
                        </li>
                        <li class="menu__item selector binded" data-action="sport">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_18071_2606)">
                                        <path d="M12.0003 12.0004C13.801 12.0004 15.4905 12.4763 16.95 13.3093M12.0003 12.0004C11.1 13.5598 9.84311 14.785 8.39209 15.6325M12.0003 12.0004C11.1 10.441 10.6674 8.73988 10.659 7.05954M16.95 13.3093C16.7629 13.7116 16.5565 14.1091 16.3305 14.5006C16.1045 14.8921 15.8635 15.2694 15.6087 15.6325C13.5655 18.5436 10.6328 20.5323 7.39909 21.441M16.95 13.3093C18.6587 14.2845 20.052 15.7491 20.939 17.5122M8.39209 15.6325C8.13724 15.2693 7.89622 14.8919 7.67019 14.5004C5.63231 10.9707 5.19204 6.957 6.125 3.29666M8.39209 15.6325C6.69301 16.6248 4.72775 17.0992 2.75714 16.9858M10.659 7.05954C10.6502 5.28516 11.1143 3.53393 12.0003 1.99713C12.0964 1.83032 12.1976 1.66605 12.3036 1.50454M10.659 7.05954C11.1009 7.02039 11.5483 7.00039 12.0003 7.00039C16.0757 7.00039 19.7715 8.62565 22.4749 11.2634M6.125 3.29666C3.33463 5.184 1.50037 8.37791 1.50037 12.0002C1.50037 13.8046 1.95547 15.5026 2.75714 16.9858M6.125 3.29666C7.80174 2.16256 9.82371 1.50024 12.0004 1.50024C12.1018 1.50024 12.2029 1.50168 12.3036 1.50454M12.3036 1.50454C17.7163 1.65803 22.1036 5.90786 22.4749 11.2634M22.4749 11.2634C22.4918 11.5068 22.5004 11.7525 22.5004 12.0002C22.5004 14.0219 21.929 15.9101 20.939 17.5122M20.939 17.5122C19.0892 20.5056 15.7777 22.5002 12.0004 22.5002C10.35 22.5002 8.78855 22.1195 7.39909 21.441M7.39909 21.441C5.42541 20.4773 3.79874 18.9128 2.75714 16.9858" stroke="#F2F2F2" stroke-width="1.5" stroke-linecap="round"></path>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_18071_2606">
                                            <rect width="24" height="24" fill="currentColor"></rect>
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <div class="menu__text">Спорт</div>
                        </li>
                    </ul>
                </div>
                <div class="menu__case nosort">
                    <ul class="menu__list">
                        <li class="menu__item selector" data-action="settings">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M2 12.8799V11.1199C2 10.0799 2.85 9.21994 3.9 9.21994C5.71 9.21994 6.45 7.93994 5.54 6.36994C5.02 5.46994 5.33 4.29994 6.24 3.77994L7.97 2.78994C8.76 2.31994 9.78 2.59994 10.25 3.38994L10.36 3.57994C11.26 5.14994 12.74 5.14994 13.65 3.57994L13.76 3.38994C14.23 2.59994 15.25 2.31994 16.04 2.78994L17.77 3.77994C18.68 4.29994 18.99 5.46994 18.47 6.36994C17.56 7.93994 18.3 9.21994 20.11 9.21994C21.15 9.21994 22.01 10.0699 22.01 11.1199V12.8799C22.01 13.9199 21.16 14.7799 20.11 14.7799C18.3 14.7799 17.56 16.0599 18.47 17.6299C18.99 18.5399 18.68 19.6999 17.77 20.2199L16.04 21.2099C15.25 21.6799 14.23 21.3999 13.76 20.6099L13.65 20.4199C12.75 18.8499 11.27 18.8499 10.36 20.4199L10.25 20.6099C9.78 21.3999 8.76 21.6799 7.97 21.2099L6.24 20.2199C5.33 19.6999 5.02 18.5299 5.54 17.6299C6.45 16.0599 5.71 14.7799 3.9 14.7799C2.85 14.7799 2 13.9199 2 12.8799Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="menu__text">Настройки</div>
                        </li>
                        <li class="menu__item selector" data-action="about">
                            <div class="menu__ico">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.06107 20.0451L5.50191 19.4383L5.06107 20.0451ZM3.95491 18.9389L4.56168 18.4981L3.95491 18.9389ZM20.0451 18.9389L19.4383 18.4981L20.0451 18.9389ZM18.9389 20.0451L18.4981 19.4383L18.9389 20.0451ZM18.9389 3.95491L18.4981 4.56168L18.9389 3.95491ZM20.0451 5.06107L19.4383 5.50191L20.0451 5.06107ZM5.06107 3.95491L5.50191 4.56168L5.06107 3.95491ZM3.95491 5.06107L4.56168 5.50191L3.95491 5.06107ZM12.75 11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11H12.75ZM11.25 17C11.25 17.4142 11.5858 17.75 12 17.75C12.4142 17.75 12.75 17.4142 12.75 17H11.25ZM12 20.25C10.1084 20.25 8.74999 20.249 7.69804 20.135C6.66013 20.0225 6.00992 19.8074 5.50191 19.4383L4.62023 20.6518C5.42656 21.2377 6.37094 21.5 7.53648 21.6263C8.68798 21.751 10.1418 21.75 12 21.75V20.25ZM2.25 12C2.25 13.8582 2.24897 15.312 2.37373 16.4635C2.50001 17.6291 2.76232 18.5734 3.34815 19.3798L4.56168 18.4981C4.19259 17.9901 3.97745 17.3399 3.865 16.302C3.75103 15.25 3.75 13.8916 3.75 12H2.25ZM5.50191 19.4383C5.14111 19.1762 4.82382 18.8589 4.56168 18.4981L3.34815 19.3798C3.70281 19.8679 4.13209 20.2972 4.62023 20.6518L5.50191 19.4383ZM20.25 12C20.25 13.8916 20.249 15.25 20.135 16.302C20.0225 17.3399 19.8074 17.9901 19.4383 18.4981L20.6518 19.3798C21.2377 18.5734 21.5 17.6291 21.6263 16.4635C21.751 15.312 21.75 13.8582 21.75 12H20.25ZM12 21.75C13.8582 21.75 15.312 21.751 16.4635 21.6263C17.6291 21.5 18.5734 21.2377 19.3798 20.6518L18.4981 19.4383C17.9901 19.8074 17.3399 20.0225 16.302 20.135C15.25 20.249 13.8916 20.25 12 20.25V21.75ZM19.4383 18.4981C19.1762 18.8589 18.8589 19.1762 18.4981 19.4383L19.3798 20.6518C19.8679 20.2972 20.2972 19.8679 20.6518 19.3798L19.4383 18.4981ZM12 3.75C13.8916 3.75 15.25 3.75103 16.302 3.865C17.3399 3.97745 17.9901 4.19259 18.4981 4.56168L19.3798 3.34815C18.5734 2.76232 17.6291 2.50001 16.4635 2.37373C15.312 2.24897 13.8582 2.25 12 2.25V3.75ZM21.75 12C21.75 10.1418 21.751 8.68798 21.6263 7.53648C21.5 6.37094 21.2377 5.42656 20.6518 4.62023L19.4383 5.50191C19.8074 6.00992 20.0225 6.66013 20.135 7.69804C20.249 8.74999 20.25 10.1084 20.25 12H21.75ZM18.4981 4.56168C18.8589 4.82382 19.1762 5.14111 19.4383 5.50191L20.6518 4.62023C20.2972 4.13209 19.8679 3.70281 19.3798 3.34815L18.4981 4.56168ZM12 2.25C10.1418 2.25 8.68798 2.24897 7.53648 2.37373C6.37094 2.50001 5.42656 2.76232 4.62023 3.34815L5.50191 4.56168C6.00992 4.19259 6.66013 3.97745 7.69804 3.865C8.74999 3.75103 10.1084 3.75 12 3.75V2.25ZM3.75 12C3.75 10.1084 3.75103 8.74999 3.865 7.69804C3.97745 6.66013 4.19259 6.00992 4.56168 5.50191L3.34815 4.62023C2.76232 5.42656 2.50001 6.37094 2.37373 7.53648C2.24897 8.68798 2.25 10.1418 2.25 12H3.75ZM4.62023 3.34815C4.13209 3.70281 3.70281 4.13209 3.34815 4.62023L4.56168 5.50191C4.82382 5.14111 5.14111 4.82382 5.50191 4.56168L4.62023 3.34815ZM11.25 11V17H12.75V11H11.25Z" fill="currentColor"></path>
                                    <path d="M13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <div class="menu__text">Инфо</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // CSS styles for the menu
    var styles = `
        .menu {
            display: flex;
            flex-direction: column;
            width: 250px;
            background: #1a1a1a;
            color: #fff;
            font-family: Arial, sans-serif;
        }
        .menu__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #333;
        }
        .menu__header-logo img {
            height: 40px;
        }
        .menu__header-time {
            text-align: right;
        }
        .menu__time-now {
            font-size: 1.2em;
            font-weight: bold;
        }
        .menu__time-date, .menu__time-week {
            font-size: 0.9em;
        }
        .menu__case {
            padding: 10px 0;
        }
        .menu__list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .menu__item {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            cursor: pointer;
        }
        .menu__item:hover, .menu__item.selector {
            background: #333;
        }
        .menu__ico {
            margin-right: 10px;
        }
        .menu__ico svg {
            width: 24px;
            height: 24px;
        }
        .menu__text {
            font-size: 1em;
        }
        .menu__case.nosort {
            border-top: 1px solid #333;
        }
    `;

    // Function to update time display
    function updateTime() {
        var now = new Date();
        var hours = now.getHours().toString().padStart(2, '0');
        var minutes = now.getMinutes().toString().padStart(2, '0');
        var timeString = `${hours}:${minutes}`;
        var dateString = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        var weekString = now.toLocaleDateString('ru-RU', { weekday: 'long' });

        var timeElement = document.querySelector('.menu__time-now');
        var dateElement = document.querySelector('.menu__time-date');
        var weekElement = document.querySelector('.menu__time-week');

        if (timeElement) timeElement.innerText = timeString;
        if (dateElement) dateElement.innerText = dateString;
        if (weekElement) weekElement.innerText = weekString;
    }

    // Function to inject styles
    function injectStyles() {
        var styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    // Function to initialize the menu
    function initMenu() {
        // Inject styles
        injectStyles();

        // Replace Lampa's default menu
        var menuContainer = document.querySelector('.menu');
        if (menuContainer) {
            menuContainer.innerHTML = menuHTML;
        } else {
            var newMenu = document.createElement('div');
            newMenu.innerHTML = menuHTML;
            document.body.prepend(newMenu);
        }

        // Update time initially and every minute
        updateTime();
        setInterval(updateTime, 60000);

        // Add event listeners for menu items
        var menuItems = document.querySelectorAll('.menu__item');
        menuItems.forEach(function (item) {
            item.addEventListener('click', function () {
                var action = item.getAttribute('data-action');
                handleMenuAction(action);
            });
        });
    }

    // Function to handle menu actions
    function handleMenuAction(action) {
        switch (action) {
            case 'main':
                Lampa.Menu.open('main');
                break;
            case 'movie':
                Lampa.Menu.open('movie');
                break;
            case 'tv':
                Lampa.Menu.open('tv');
                break;
            case 'cartoons':
                Lampa.Menu.open('cartoons');
                break;
            case 'anime':
                Lampa.Menu.open('anime');
                break;
            case 'collections':
                Lampa.Menu.open('collections');
                break;
            case 'filter':
                Lampa.Menu.open('filter');
                break;
            case 'favorite':
                Lampa.Menu.open('favorite');
                break;
            case 'history':
                Lampa.Menu.open('history');
                break;
            case 'sport':
                // Custom action for sports (based on original JS)
                Lampa.Component.add('sport', {
                    component: 'sport',
                    title: 'Спорт',
                    onRender: function (element, params) {
                        // Logic for sports content (simplified from original JS)
                        element.innerHTML = '<div>Спортивные трансляции</div>';
                        // Add AJAX call or API integration if needed
                    }
                });
                Lampa.Menu.open('sport');
                break;
            case 'settings':
                Lampa.Menu.open('settings');
                break;
            case 'about':
                Lampa.Menu.open('about');
                break;
            default:
                console.warn('Unknown menu action:', action);
        }
    }

    // Initialize plugin when Lampa is ready
    if (window.Lampa) {
        initMenu();
        Lampa.Plugin.add(plugin);
    } else {
        document.addEventListener('lampa:load', function () {
            initMenu();
            Lampa.Plugin.add(plugin);
        });
    }
})();