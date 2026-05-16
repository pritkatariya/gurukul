
import { FaUser } from 'react-icons/fa'
import '../../../App.css'
import Input from '../../../Components/commen/Input'
import { PiPasswordFill } from 'react-icons/pi'

export default function CreateRoll() {
    return (
        <div className={`w-full h-full flex flex-col justify-center items-center`}>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-red-950 uppercase tracking-tight">
                    Create New Role / Permission
                </h1>
                <p className="text-gray-500 text-sm mt-1">Add a new profile with custom access roles to the Gurukul system</p>
                <div className="h-1.5 w-16 bg-red-800 mx-auto mt-3 rounded-full" />
            </div>
            <div className="min-w-7xl p-3 h-190 shadow-md shadow-gray-950 rounded-3xl overflow-y-auto scrolls">
                <div className={`relative w-full h-50 mt-5 rounded-2xl gap-4 border border-gray-400 flex justify-center items-center flex-col p-3`}>
                    <p className={`absolute left-10 bg-white pl-3 pr-3 text-lf font-bold -top-3.5`}>Roll Information</p>

                    <Input
                        label='Roll Name'
                        icon={<FaUser />}
                        placeholder='Enter Roll name'
                    />
                    <Input
                        type='password'
                        label='Roll Code'
                        icon={<PiPasswordFill />}
                        placeholder='Enter Roll name'
                    />
                </div>
                <div className={`relative w-full h-auto mt-5 rounded-2xl gap-4 border border-gray-400 flex justify-center items-center flex-col p-3`}>
                    <p className={`absolute left-10 bg-white pl-3 pr-3 text-lf font-bold -top-3.5`}
                    >
                        Permissions
                    </p>
                    <div className={`w-full h-20 rounded-2xl`}>

                    </div>
                </div>
            </div>
        </div>
    )
}
